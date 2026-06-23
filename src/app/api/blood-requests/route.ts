import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, bloodType, urgency, location, message } = body;

    if (!name || !bloodType || !location || !phone) {
      return NextResponse.json({ error: 'name, bloodType, location, and phone are required' }, { status: 400 });
    }

    const request = await prisma.emergencyAlert.create({
      data: {
        userId: '',
        alertType: 'BLOOD_REQUEST',
        location,
        description: `Blood needed: ${bloodType} (${urgency}) - ${name} - ${message || ''}`,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ message: 'Blood request submitted', id: request.id });
  } catch (error) {
    console.error('Blood request error:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}
