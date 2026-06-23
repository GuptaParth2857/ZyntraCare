import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';

  try {
    const where: any = {};
    if (userId) where.userId = userId;

    const bookings = await prisma.appointment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Lab bookings GET error:', error);
    return NextResponse.json({ bookings: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const booking = await prisma.appointment.create({
      data: {
        userId: body.userId,
        doctorName: body.labName || 'Lab Test',
        specialty: body.testType || 'Lab Test',
        date: body.date,
        time: body.time,
        notes: body.notes || '',
        fee: body.fee || 0,
        status: 'pending',
        isOnline: false,
      },
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Lab bookings POST error:', error);
    return NextResponse.json({ error: 'Failed to book lab test' }, { status: 500 });
  }
}
