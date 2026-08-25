import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const where: any = {};
    if (userId) where.userId = userId;

    const bookings = await prisma.appointment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        hospital: { select: { name: true, city: true } },
        doctor: { select: { specialty: true, user: { select: { name: true } } } },
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Bookings GET error:', error);
    return NextResponse.json({ bookings: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId, hospitalId, doctorName, specialty,
      date, time, appointmentType, patientName,
      patientPhone, patientAge, symptoms, fee,
    } = body;

    const booking = await prisma.appointment.create({
      data: {
        userId: userId || 'guest',
        hospitalId: hospitalId || null,
        doctorId: null,
        doctorName: doctorName || patientName || 'Patient',
        specialty: specialty || 'General',
        date,
        time,
        status: 'confirmed',
        notes: symptoms || '',
        fee: fee || 0,
        isOnline: appointmentType?.toLowerCase().includes('video') || false,
      },
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('Bookings POST error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
