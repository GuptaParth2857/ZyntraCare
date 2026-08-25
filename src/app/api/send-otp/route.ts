import { NextRequest, NextResponse } from 'next/server';
import { authRateLimit } from '@/lib/rate-limit';
import { validateBody, sendOtpSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMSGateway(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioFrom) {
    console.error('[SMS] Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    const twilio = await import('twilio');
    const client = twilio.default(accountSid, authToken);

    const message = await client.messages.create({
      body: `Your ZyntraCare OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`,
      from: twilioFrom,
      to: `+91${phone.replace(/^\+91/, '')}`,
    });

    console.log(`[SMS] Sent to ${phone}: ${message.sid}`);
    return { success: true };
  } catch (error: any) {
    console.error('[SMS] Failed to send:', error.message);
    return { success: false, error: error.message };
  }
}

export async function POST(req: NextRequest) {
  const rateLimitCheck = await authRateLimit(req);
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

      const smsResult = await sendSMSGateway(normalizedPhone, otp);
      
      if (!smsResult.success) {
        // In development, still return success but log the OTP
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DEV] OTP for ${normalizedPhone}: ${otp}`);
          return NextResponse.json({
            success: true,
            message: `OTP sent to ${phone.slice(0, -4).replace(/./g, '*')}XXXX`,
            expiresIn: 300,
            devOtp: otp,
          });
        }
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
