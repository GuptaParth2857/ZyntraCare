import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

function isRuralHospital(name: string): boolean {
  const lower = name.toLowerCase();
  const rural = ['rural', 'phc', 'chc', 'taluka', 'primary', 'district'];
  const urban = ['city', 'metro', 'urban', 'corporate'];
  const hasRural = rural.some(k => lower.includes(k));
  const hasUrban = urban.some(k => lower.includes(k));
  return hasRural && !hasUrban;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get('specialty');
    const rural = searchParams.get('rural') === 'true';

    const doctors = await prisma.doctor.findMany({
      where: {
        ...(specialty && specialty !== 'all' ? { specialty } : {}),
      },
      include: {
        user: { select: { name: true } },
        hospitalLinks: {
          include: { hospital: { select: { name: true } } },
        },
      },
    });

    let consultations = doctors.map(doc => ({
      id: doc.id,
      doctorName: doc.user.name || 'Unknown',
      specialty: doc.specialty,
      hospital: doc.hospitalLinks[0]?.hospital.name || 'Independent',
      isRural: doc.hospitalLinks[0] ? isRuralHospital(doc.hospitalLinks[0].hospital.name) : false,
      available: doc.isAvailable,
    }));

    if (rural) {
      consultations = consultations.filter(c => c.isRural);
    }

    return NextResponse.json({
      success: true,
      count: consultations.length,
      consultations,
    });
  } catch (error) {
    console.error('Telehealth GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { consultationId, userId: bodyUserId, date, time } = body;

    if (!consultationId || !date || !time) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const token = await getToken({ req });
    const userId = bodyUserId || token?.sub || '';

    const doctor = await prisma.doctor.findUnique({
      where: { id: consultationId },
      include: { user: { select: { name: true } } },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    if (!doctor.isAvailable) {
      return NextResponse.json({ error: 'Consultation not available' }, { status: 400 });
    }

    const meetingId = `zyntra-${doctor.id}-${Date.now().toString(36)}`;
    const meetingLink = `https://meet.jit.si/${meetingId}`;

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        doctorId: doctor.id,
        doctorName: doctor.user.name || 'Unknown',
        specialty: doctor.specialty,
        date,
        time,
        status: 'confirmed',
        isOnline: true,
        meetingLink,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Consultation booked successfully',
      meetingLink,
      booking: {
        id: appointment.id,
        consultationId,
        userId,
        date,
        time,
      },
    });
  } catch (error) {
    console.error('Telehealth POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
