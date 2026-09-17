import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

function parseSystolic(bp: string): number | null {
  const match = bp.match(/(\d+)\s*\/\s*\d+/);
  if (match) return parseInt(match[1], 10);
  const single = parseInt(bp, 10);
  return Number.isFinite(single) ? single : null;
}

function bpCategory(sys: number): { label: string; status: 'normal' | 'warning' | 'critical' } {
  if (sys < 120) return { label: 'Normal', status: 'normal' };
  if (sys < 130) return { label: 'Elevated', status: 'warning' };
  if (sys < 140) return { label: 'Hypertension Stage 1', status: 'warning' };
  return { label: 'Hypertension Stage 2', status: 'critical' };
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { searchParams } = new URL(req.url);
    const userId = (token?.id as string) || searchParams.get('userId') || '';

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const metrics = await prisma.healthMetric.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    if (metrics.length === 0) {
      return NextResponse.json({
        hasData: false,
        trend: [],
        reference: [],
        insights: [],
        summary: null,
        generatedAt: new Date().toISOString(),
        note: 'Log your vitals in the Health Tracker to unlock personal analytics.',
      });
    }

    const enriched = metrics.map((m) => ({
      date: m.date,
      heartRate: m.heartRate,
      bp: parseSystolic(m.bloodPressure),
      oxygen: m.oxygenLevel,
      weight: m.weight,
    }));

    const start = new Date(enriched[0].date + 'T00:00:00Z').getTime();
    const weeklyMap = new Map<number, { label: string; heartRate: number[]; bp: number[]; oxygen: number[]; weight: number[] }>();
    for (const row of enriched) {
      const idx = Math.floor((new Date(row.date + 'T00:00:00Z').getTime() - start) / (7 * 86400000)) + 1;
      const entry = weeklyMap.get(idx) || { label: `Week ${idx}`, heartRate: [], bp: [], oxygen: [], weight: [] };
      if (row.heartRate != null) entry.heartRate.push(row.heartRate);
      if (row.bp != null) entry.bp.push(row.bp);
      if (row.oxygen != null) entry.oxygen.push(row.oxygen);
      if (row.weight != null) entry.weight.push(row.weight);
      weeklyMap.set(idx, entry);
    }

    const avg = (arr: number[]) => (arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : null);
    const trend = [...weeklyMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, w]) => ({
        date: w.label,
        heartRate: avg(w.heartRate),
        bp: avg(w.bp),
        oxygen: avg(w.oxygen),
        weight: avg(w.weight),
      }));

    const latestRow = enriched[enriched.length - 1];
    const latest = {
      heartRate: latestRow.heartRate,
      bp: latestRow.bp,
      oxygen: latestRow.oxygen,
      weight: latestRow.weight,
      date: latestRow.date,
    };

    const height = metrics[metrics.length - 1].height;
    const bmi = latest.weight && height ? Number((latest.weight / Math.pow(height / 100, 2)).toFixed(1)) : null;

    const reference = [
      {
        metric: 'Resting Heart Rate',
        value: latest.heartRate,
        unit: 'bpm',
        range: '60-100',
        status: latest.heartRate == null
          ? 'missing' as const
          : latest.heartRate >= 60 && latest.heartRate <= 100 ? ('normal' as const) : latest.heartRate > 100 ? ('warning' as const) : ('warning' as const),
      },
      {
        metric: 'Systolic Blood Pressure',
        value: latest.bp,
        unit: 'mmHg',
        range: '<120 optimal',
        status: latest.bp == null ? 'missing' as const : bpCategory(latest.bp).status,
      },
      {
        metric: 'Blood Oxygen',
        value: latest.oxygen,
        unit: '% SpO2',
        range: '95–100',
        status: latest.oxygen == null ? 'missing' as const : latest.oxygen >= 95 ? ('normal' as const) : ('critical' as const),
      },
      {
        metric: 'BMI',
        value: bmi,
        unit: 'kg/m²',
        range: '18.5–24.9',
        status: bmi == null ? 'missing' as const : bmi >= 18.5 && bmi <= 24.9 ? ('normal' as const) : ('warning' as const),
      },
    ];

    const insights: {
      category: 'heart' | 'activity' | 'risk';
      title: string;
      description: string;
      severity: 'positive' | 'warning' | 'critical' | 'info';
      recommendation: string;
    }[] = [];

    if (latest.bp != null) {
      const cat = bpCategory(latest.bp);
      if (cat.status !== 'normal') {
        insights.push({
          category: 'heart',
          title: `${cat.label}: ${latest.bp} mmHg`,
          description: `Your latest systolic blood pressure of ${latest.bp} mmHg is ${cat.label.toLowerCase()} per ACC/AHA guidelines (normal < 120 mmHg).`,
          severity: cat.status,
          recommendation: cat.status === 'critical'
            ? 'Please consult a doctor soon. Monitor your BP daily and reduce salt intake.'
            : 'Monitor your BP regularly, reduce salt, and keep moderate physical activity going.',
        });
      }
    }

    if (latest.heartRate != null && (latest.heartRate < 60 || latest.heartRate > 100)) {
      insights.push({
        category: 'heart',
        title: `Resting Heart Rate ${latest.heartRate} bpm`,
        description: `Your latest heart rate of ${latest.heartRate} bpm is outside the normal resting range of 60–100 bpm.`,
        severity: 'warning',
        recommendation: 'Track your HR in the morning. If it stays abnormal, consult a doctor.',
      });
    }

    if (latest.oxygen != null && latest.oxygen < 95) {
      insights.push({
        category: 'risk',
        title: `Low Blood Oxygen: ${latest.oxygen}%`,
        description: `Your latest SpO2 reading of ${latest.oxygen}% is below the normal threshold of 95%.`,
        severity: 'critical',
        recommendation: 'Recheck SpO2 while resting. If it stays below 95%, seek medical attention.',
      });
    }

    if (bmi != null && (bmi < 18.5 || bmi > 24.9)) {
      insights.push({
        category: 'risk',
        title: `BMI ${bmi} kg/m²`,
        description: bmi < 18.5
          ? 'Your BMI is in the underweight range (below 18.5).'
          : 'Your BMI is in the overweight range (above 24.9).',
        severity: 'warning',
        recommendation: 'Work with balanced nutrition and regular activity toward the healthy 18.5–24.9 range.',
      });
    }

    if (trend.length >= 2 && latest.weight != null && trend[0].weight != null) {
      const diff = Number((latest.weight - trend[0].weight!).toFixed(1));
      if (Math.abs(diff) >= 0.5) {
        insights.push({
          category: 'activity',
          title: `Weight trending ${diff < 0 ? 'down' : 'up'} ${Math.abs(diff)} kg`,
          description: `Your weight changed by ${Math.abs(diff)} kg between your first and latest logged readings.`,
          severity: 'info',
          recommendation: diff < 0
            ? 'Make sure you are not losing weight unintentionally.'
            : 'Keep monitoring; steady weight gain may need attention.',
        });
      }
    }

    if (insights.length === 0) {
      insights.push({
        category: 'risk',
        title: 'Vitals within normal range',
        description: 'Your latest logged vitals fall within standard clinical reference ranges.',
        severity: 'positive',
        recommendation: 'Keep logging regularly and continue your current healthy habits.',
      });
    }

    return NextResponse.json({
      hasData: true,
      trend,
      reference,
      insights,
      summary: latest,
      generatedAt: new Date().toISOString(),
      note: 'Compared against standard clinical reference ranges (ACC/AHA/CDC guidelines). Personal analytics are computed from your logged health records only.',
    });
  } catch (error) {
    console.error('Personal analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}