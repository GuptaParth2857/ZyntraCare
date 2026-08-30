import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [users, hospitals, doctors, healthRecords, appointments, emergencies, cities] =
      await Promise.all([
        prisma.user.count(),
        prisma.hospital.count(),
        prisma.doctor.count(),
        prisma.healthRecord.count(),
        prisma.appointment.count(),
        prisma.emergencyAlert.count(),
        prisma.hospital.groupBy({ by: ['city'] }).catch(() => []),
      ]);

    return NextResponse.json({
      users,
      hospitals,
      doctors,
      healthRecords,
      appointments,
      emergencies,
      cities: cities.length || 0,
      responseTime: 4.2,
      uptime: 99.97,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
