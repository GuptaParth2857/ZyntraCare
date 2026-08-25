import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const body = await req.json();

    const where: any = {};
    if (token?.id) {
      where.id = token.id;
    } else if (body.phone) {
      where.phone = body.phone.replace(/\s/g, '').replace(/^\+91/, '91');
    } else {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data: any = {};
    if (body.name) data.name = body.name;
    if (body.city) data.city = body.city;
    if (body.age) data.age = parseInt(body.age);
    if (body.bloodGroup) data.bloodGroup = body.bloodGroup;
    if (body.conditions) data.conditions = body.conditions;

    await prisma.user.update({ where, data });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
