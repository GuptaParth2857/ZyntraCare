import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // In production, you would:
    // 1. Check if user exists in database
    // 2. Generate a reset token and store it
    // 3. Send email with reset link
    
    // For demo, we simulate success
    console.log(`Password reset requested for: ${email}`);
    
    // Simulate sending email (in production, use actual email service)
    // await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists, a reset link has been sent' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}