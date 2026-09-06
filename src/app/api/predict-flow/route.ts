import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

let cache: { data: number[]; expiresAt: number } | null = null;

const LEVEL_VALUES: Record<string, number> = {
  low: 8,
  medium: 22,
  high: 42,
  very_high: 68,
};

export async function GET() {
  if (cache && Date.now() < cache.expiresAt) {
    return NextResponse.json(cache.data, {
      headers: {
        'X-Cache': 'HIT',
        'X-Cache-TTL': String(Math.round((cache.expiresAt - Date.now()) / 1000)),
      },
    });
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const reports = await prisma.footfallReport.findMany({
      where: { reportDate: { gte: sevenDaysAgo } },
      select: { level: true, reportDate: true },
    });

    const hourly: Record<number, { sum: number; count: number }> = {};
    for (let i = 0; i < 24; i++) {
      hourly[i] = { sum: 0, count: 0 };
    }

    for (const report of reports) {
      const hour = new Date(report.reportDate).getHours();
      const value = LEVEL_VALUES[report.level] ?? 10;
      hourly[hour].sum += value;
      hourly[hour].count += 1;
    }

    if (reports.length === 0) {
      return NextResponse.json([], {
        headers: { 'X-Source': 'no-data' },
      });
    }

    const predictions: number[] = [];
    for (let i = 0; i < 24; i++) {
      const { sum, count } = hourly[i];
      predictions.push(Math.round(sum / count));
    }

    cache = { data: predictions, expiresAt: Date.now() + 30 * 60 * 1000 };

    return NextResponse.json(predictions, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error('Predict Flow GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
