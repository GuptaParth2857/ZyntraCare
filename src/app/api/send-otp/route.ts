import { NextRequest, NextResponse } from 'next/server';
import { authRateLimit } from '@/lib/rate-limit';
import { validateBody, sendOtpSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMSGateway(phone: string, otp: string): Promise<boolean> {
  console.log(`[OTP SMS] To: ${phone} | OTP: ${otp}`);
  return true;
}

export async function POST(req: NextRequest) {
  const rateLimitCheck = authRateLimit(req);
  if (rateLimitCheck) return rateLimitCheck;

  try {
    const body = await req.json();
    const validation = validateBody(sendOtpSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { phone, action, otp: inputOtp } = validation.data;
    const normalizedPhone = phone.replace(/\s/g, '').replace(/^\+91/, '91');

    if (action === 'verify') {
      const stored = await prisma.otpToken.findFirst({
        where: { phone: normalizedPhone, used: false },
        orderBy: { createdAt: 'desc' }
      });

      if (!stored) {
        return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 });
      }

      if (Date.now() > stored.expiresAt.getTime()) {
        await prisma.otpToken.update({ where: { id: stored.id }, data: { used: true } });
        return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
      }

      if (stored.otp !== inputOtp) {
        return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 });
      }

      await prisma.otpToken.update({ where: { id: stored.id }, data: { used: true } });
      return NextResponse.json({ success: true, verified: true, message: 'Phone verified successfully' });

    } else {
      const existing = await prisma.otpToken.findFirst({
        where: { phone: normalizedPhone, used: false }
      });

      if (existing && Date.now() < existing.expiresAt.getTime() - 240000) {
        return NextResponse.json({ error: 'Please wait before requesting another OTP', retryAfter: 60 }, { status: 429 });
      }

      const otp = generateOTP();
      const expires = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.otpToken.create({
        data: { phone: normalizedPhone, otp, expiresAt: expires }
      });

      const sent = await sendSMSGateway(phone, otp);
      if (!sent) {
        return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `OTP sent to ${phone.slice(0, -4).replace(/./g, '*')}XXXX`,
        expiresIn: 300,
      });
    }
  } catch (error) {
    console.error('OTP error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}