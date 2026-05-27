import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

let cache: { data: number[]; expiresAt: number } | null = null;

const LEVEL_VALUES: Record<string, number> = {
  low: 8,
  medium: 22,
  high: 42,
  very_high: 68,
};

function getFallbackHour(hour: number): number {
  const baseline = [
    3, 2, 2, 2, 3, 5,
    8, 15, 28, 45, 48, 44,
    38, 32, 30, 28, 27, 35,
    42, 40, 32, 22, 14, 7,
  ];
  return baseline[hour] + Math.floor(Math.random() * 4);
}

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

    const predictions: number[] = [];
    for (let i = 0; i < 24; i++) {
      const { sum, count } = hourly[i];
      predictions.push(count > 0 ? Math.round(sum / count) : getFallbackHour(i));
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
