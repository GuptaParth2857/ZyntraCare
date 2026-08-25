import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

const VERIFICATION_TOKENS = new Map<string, { email: string; expires: number }>();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const token = crypto.randomUUID();
    const expires = Date.now() + 24 * 60 * 60 * 1000;

    VERIFICATION_TOKENS.set(token, { email, expires });

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;
    await sendEmail({
      to: email,
      subject: 'Verify your ZyntraCare email',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0ea5e9;">Verify Your Email</h1>
          <p>Click the link below to verify your email address:</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Verify Email</a>
          <p>Or copy this link: ${verifyUrl}</p>
          <p>This link expires in 24 hours.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    });

  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const verification = VERIFICATION_TOKENS.get(token);

  if (!verification) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  if (Date.now() > verification.expires) {
    VERIFICATION_TOKENS.delete(token);
    return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
  }

  VERIFICATION_TOKENS.delete(token);

  const user = await prisma.user.findUnique({ where: { email: verification.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await prisma.user.update({
    where: { email: verification.email },
    data: { emailVerified: true },
  });

  return NextResponse.json({
    success: true,
    message: 'Email verified successfully',
  });
}
