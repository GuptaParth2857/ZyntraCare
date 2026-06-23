import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campId, name, phone, email, age, city } = body;

    if (!campId || !name || !phone) {
      return NextResponse.json({ error: 'campId, name, and phone are required' }, { status: 400 });
    }

    const registration = await prisma.campRegistration.create({
      data: {
        campId,
        name,
        phone,
        email: email || '',
        age: age ? parseInt(age) : null,
        city: city || '',
      },
    });

    return NextResponse.json({
      message: 'Registered successfully',
      registration: { id: registration.id, name: registration.name },
    });
  } catch (error) {
    console.error('Camp registration error:', error);
    return NextResponse.json({ error: 'Failed to register for camp' }, { status: 500 });
  }
}
