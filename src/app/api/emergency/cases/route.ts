import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MOCK_CASES = [
  { id: 'EM-1049', type: 'Cardiac Arrest', patient: 'Male, ~55 yrs', priority: 'Critical', eta: '4 min', location: 'Connaught Place', unit: 'AMB-02', timestamp: new Date().toISOString() },
  { id: 'EM-1048', type: 'Road Accident', patient: 'Female, ~28 yrs', priority: 'High', eta: '12 min', location: 'Ring Road, Lajpat', unit: 'AMB-01', timestamp: new Date().toISOString() },
  { id: 'EM-1047', type: 'Stroke', patient: 'Male, ~68 yrs', priority: 'Critical', eta: '8 min', location: 'Defence Colony', unit: 'AMB-04', timestamp: new Date().toISOString() },
  { id: 'EM-1046', type: 'Fracture', patient: 'Child, ~10 yrs', priority: 'Medium', eta: '18 min', location: 'Saket', unit: 'AMB-03', timestamp: new Date().toISOString() },
];

export async function GET(req: NextRequest) {
  try {
    const alerts = await prisma.emergencyAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: { name: true, phone: true }
        }
      }
    });

    if (alerts.length === 0) {
      return NextResponse.json({ cases: MOCK_CASES });
    }

    const cases = alerts.map((alert, idx) => ({
      id: `EM-${1000 + idx}`,
      type: alert.alertType || 'Emergency',
      patient: alert.user?.name || 'Unknown',
      priority: alert.status === 'critical' ? 'Critical' : 'High',
      eta: `${Math.floor(Math.random() * 20) + 1} min`,
      location: alert.location,
      unit: 'AMB-0' + ((idx % 5) + 1),
      timestamp: alert.createdAt.toISOString(),
    }));

    return NextResponse.json({ cases });
  } catch (error) {
    console.error('Emergency cases error:', error);
    return NextResponse.json({ cases: MOCK_CASES });
  }
}