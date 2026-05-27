import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'Quiet', color: '#22c55e' },
  medium: { label: 'Moderate', color: '#eab308' },
  high: { label: 'Crowded', color: '#f97316' },
  very_high: { label: 'Very Busy', color: '#ef4444' },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const footfallData: Record<string, { level: string; label: string; color: string; count: number; lastUpdated: number }> = {};

    for (const id of hospitalIds) {
      const latest = await prisma.footfallReport.findFirst({
        where: { hospitalId: id, reportDate: { gte: oneHourAgo } },
        orderBy: { reportDate: 'desc' },
      });

      if (latest) {
        const info = LABELS[latest.level] || { label: 'Unknown', color: '#9ca3af' };
        footfallData[id] = {
          level: latest.level,
          label: info.label,
          color: info.color,
          count: await prisma.footfallReport.count({
            where: { hospitalId: id, reportDate: { gte: new Date(Date.now() - 30 * 60 * 1000) } },
          }),
          lastUpdated: latest.reportDate.getTime(),
        };
      }
    }

    return NextResponse.json({ footfall: footfallData });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch footfall data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.hospitalId || !body.level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validLevels = ['low', 'medium', 'high', 'very_high'];
    if (!validLevels.includes(body.level)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }

    const report = await prisma.footfallReport.create({
      data: {
        hospitalId: body.hospitalId,
        hospitalName: body.hospitalName || '',
        level: body.level,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
