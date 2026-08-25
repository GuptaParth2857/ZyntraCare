import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const alerts = await prisma.emergencyAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: { name: true, phone: true },
        },
      },
    });

    const cases = alerts.map((alert, idx) => ({
      id: `EM-${1000 + idx}`,
      type: alert.alertType || 'Emergency',
      patient: alert.user?.name || alert.description?.split(',')[0] || 'Unknown',
      priority: alert.status === 'critical' ? 'Critical' : alert.status === 'high' ? 'High' : 'Medium',
      eta: `${Math.floor(Math.random() * 20) + 1} min`,
      location: alert.location,
      unit: 'AMB-0' + ((idx % 5) + 1),
      timestamp: alert.createdAt.toISOString(),
    }));

    return NextResponse.json({ cases });
  } catch (error) {
    console.error('Emergency cases error:', error);
    return NextResponse.json({ cases: [] }, { status: 500 });
  }
}
