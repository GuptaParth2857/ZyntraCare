import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      users,
      hospitals,
      appointments,
      healthRecords,
      emergencies,
      feedback,
      medicalRecords,
      prescriptions,
      patients,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.hospital.count(),
      prisma.appointment.count(),
      prisma.healthRecord.count(),
      prisma.emergencyAlert.count(),
      prisma.feedback.count(),
      prisma.patientRecord.count(),
      prisma.prescription.count(),
      prisma.patientRecord.groupBy({ by: ['gender'] }).catch(() => []),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);

    const dailyNewUsers = await Promise.all(
      Array.from({ length: 7 }).map((_, i) => {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - (6 - i));
        const next = new Date(day);
        next.setDate(next.getDate() + 1);
        return prisma.user.count({
          where: { createdAt: { gte: day, lt: next } },
        });
      })
    );

    const totalAppointments =
      appointments + medicalRecords + prescriptions;

    return NextResponse.json({
      overview: {
        totalUsers: users,
        partnerHospitals: hospitals,
        totalAppointments,
        healthRecords,
        emergencies,
        feedback,
        patients: patients.length,
        activeLast7Days: recentUsers,
      },
      weeklySignups: dailyNewUsers,
      source: 'live',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
