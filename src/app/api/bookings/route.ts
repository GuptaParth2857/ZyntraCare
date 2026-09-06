import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = searchParams.get('userId') || (token?.id as string) || '';
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!userId) {
    return NextResponse.json({ bookings: [] });
  }

  try {
    const bookings = await prisma.appointment.findMany({
      where: { userId },
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
      userId, hospitalId, doctorId, doctorName, specialty,
      date, time, appointmentType, patientName,
      patientPhone, patientAge, symptoms, fee,
    } = body;

    // Resolve a valid user id. Guest mode (no login) must attach to a stable
    // guest account, otherwise the userId->User FK fails. A real logged-in
    // user id is used when provided.
    let ownerId: string;
    if (userId) {
      const existing = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      ownerId = existing ? existing.id : 'guest';
    } else {
      ownerId = 'guest';
    }
    const guestUser = await prisma.user.findUnique({ where: { id: ownerId }, select: { id: true } });
    if (!guestUser) {
      await prisma.user.create({ data: { id: 'guest', email: 'guest@zyntracare.app', name: 'Guest' } });
      ownerId = 'guest';
    }

    // Only link a real doctor if a valid one was selected (avoids FK errors
    // when the doctor id is missing/garbage).
    let resolvedDoctorId: string | null = null;
    if (doctorId) {
      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { id: true } });
      if (doctor) resolvedDoctorId = doctor.id;
    }

    const booking = await prisma.appointment.create({
      data: {
        userId: ownerId,
        hospitalId: hospitalId || null,
        doctorId: resolvedDoctorId,
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
