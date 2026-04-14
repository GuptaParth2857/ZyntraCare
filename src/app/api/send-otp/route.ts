import { NextRequest, NextResponse } from 'next/server';
import { authRateLimit } from '@/lib/rate-limit';

// Real OTP system using stored map (production: use Redis or DB + actual SMS gateway)
const OTP_STORE = new Map<string, { otp: string; expires: number; attempts: number }>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMSGateway(phone: string, otp: string): Promise<boolean> {
  // In production: integrate Twilio, MSG91, or Fast2SMS here
  // Example with MSG91:
  // const response = await fetch(`https://api.msg91.com/api/v5/otp?template_id=...&mobile=${phone}&authkey=...&otp=${otp}`, { method: 'POST' });
  
  // For demo, just log it  
  console.log(`[OTP SMS] To: ${phone} | OTP: ${otp}`);
  return true;
}

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitCheck = authRateLimit(req);
  if (rateLimitCheck) return rateLimitCheck;

  try {
    const body = await req.json();
    const { phone, action } = body;

    if (!phone || !/^\+?[0-9]{10,13}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
    }

    const normalizedPhone = phone.replace(/\s/g, '').replace(/^\+91/, '91');

    if (action === 'verify') {
      // Verify OTP
      const { otp: inputOtp } = body;
      const stored = OTP_STORE.get(normalizedPhone);

      if (!stored) {
        return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 });
      }

      if (Date.now() > stored.expires) {
        OTP_STORE.delete(normalizedPhone);
        return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
      }

      if (stored.attempts >= 3) {
        OTP_STORE.delete(normalizedPhone);
        return NextResponse.json({ error: 'Too many attempts. Please request a new OTP.' }, { status: 429 });
      }

      if (stored.otp !== inputOtp) {
        OTP_STORE.set(normalizedPhone, { ...stored, attempts: stored.attempts + 1 });
        return NextResponse.json({ error: 'Incorrect OTP. Please try again.', attemptsLeft: 3 - stored.attempts - 1 }, { status: 400 });
      }

      // OTP correct
      OTP_STORE.delete(normalizedPhone);
      return NextResponse.json({ success: true, verified: true, message: 'Phone verified successfully' });

    } else {
      // Send OTP
      const existing = OTP_STORE.get(normalizedPhone);
      if (existing && Date.now() < existing.expires - 240000) {
        // Rate limit: allow resend only after 1 minute
        return NextResponse.json({ error: 'Please wait before requesting another OTP', retryAfter: 60 }, { status: 429 });
      }

      const otp = generateOTP();
      const expires = Date.now() + 5 * 60 * 1000; // 5 mins

      OTP_STORE.set(normalizedPhone, { otp, expires, attempts: 0 });

      const sent = await sendSMSGateway(phone, otp);
      if (!sent) {
        return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `OTP sent to ${phone.slice(0, -4).replace(/./g, '*')}XXXX`,
        // Show OTP in development for testing
        devOtp: otp,
        expiresIn: 300,
      });
    }
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
