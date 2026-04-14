import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, secretKey } = body;

    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'zyntracare-admin-2024';
    
    if (secretKey !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Invalid secret key' }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' }
    });

    console.log('[Admin] User promoted to admin:', email);

    return NextResponse.json({ success: true, message: `User ${email} is now admin` });
  } catch (error) {
    console.error('[Admin] Error:', error);
    return NextResponse.json({ error: 'Failed to promote admin' }, { status: 500 });
  }
}
