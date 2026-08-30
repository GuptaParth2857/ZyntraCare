import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const FEATURES = [
  { name: 'Disease Risk Detection', icon: 'target' },
  { name: 'Hospital Bed Tracking', icon: 'bed' },
  { name: 'Emergency Response', icon: 'alert' },
  { name: 'Ambulance Booking', icon: 'ambulance' },
  { name: 'Telehealth Access', icon: 'video' },
  { name: 'Symptom AI Checker', icon: 'brain' },
  { name: 'Health Records', icon: 'database' },
  { name: 'Pharmacy & Delivery', icon: 'pill' },
  { name: 'Lab Booking', icon: 'lab' },
];

export async function GET() {
  try {
    const [users, hospitals, doctors, appointments, healthRecords, ambulances, drones, beds, emergencyAlerts] =
      await Promise.all([
        prisma.user.count(),
        prisma.hospital.count(),
        prisma.doctor.count(),
        prisma.appointment.count(),
        prisma.healthRecord.count(),
        prisma.ambulance.count().catch(() => 0),
        prisma.drone.count().catch(() => 0),
        prisma.hospitalBed.count().catch(() => 0),
        prisma.emergencyAlert.count().catch(() => 0),
      ]);

    const stages = FEATURES.map((f, i) => {
      const progress = Math.min(100, Math.round(((i + 1) / FEATURES.length) * 100));
      return { ...f, progress, status: progress >= 100 ? 'live' : progress >= 70 ? 'stable' : 'building' };
    });

    return NextResponse.json({
      project: 'ZyntraCare',
      repo: 'GuptaParth2857/ZyntraCare',
      framework: 'Next.js 16 + React 19 + TypeScript',
      deployTarget: 'Docker + Vercel/Cloud Run',
      stages,
      liveStats: {
        users,
        hospitals,
        doctors,
        appointments,
        healthRecords,
        ambulances,
        drones,
        beds,
        emergencies: emergencyAlerts,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Build pipeline API error:', error);
    return NextResponse.json({ error: 'Failed to fetch deployment info' }, { status: 500 });
  }
}
