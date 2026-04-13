import { NextResponse } from 'next/server';

const VERIFICATION_TOKENS = new Map<string, { email: string; expires: number }>();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    VERIFICATION_TOKENS.set(token, { email, expires });

    console.log(`[Email Verification] Token for ${email}: ${token}`);
    console.log(`[Email Verification] Link: /verify-email/confirm?token=${token}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Verification email sent (demo mode)' 
    });

  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
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

  return NextResponse.json({ 
    success: true, 
    message: 'Email verified successfully',
    email: verification.email
  });
}