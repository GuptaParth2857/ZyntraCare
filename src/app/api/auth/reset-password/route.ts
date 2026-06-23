import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: 'Invalid token or password too short' }, { status: 400 });
    }

    const stored = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!stored) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    if (stored.used) {
      return NextResponse.json({ error: 'Token has already been used' }, { status: 400 });
    }

    if (Date.now() > stored.expiresAt.getTime()) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email: stored.email },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.update({
      where: { id: stored.id },
      data: { used: true },
    });

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
