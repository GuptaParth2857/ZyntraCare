import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Benchmark {
  metric: string;
  value: number;
  unit: string;
  percentile: number;
  status: 'good' | 'warning' | 'poor';
  ideal: string;
}

const POPULATION_BENCHMARKS: Record<string, { unit: string; idealMin: number; idealMax: number }> = {
  heartRate: { unit: 'bpm', idealMin: 60, idealMax: 100 },
  oxygenLevel: { unit: '%', idealMin: 95, idealMax: 100 },
  restingBP: { unit: 'mmHg', idealMin: 90, idealMax: 120 },
  bloodSugar: { unit: 'mg/dL', idealMin: 70, idealMax: 99 },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'demo-user';

    const metrics = await prisma.healthMetric.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    const trend = metrics.map(m => ({
      date: m.date,
      heartRate: m.heartRate,
      oxygenLevel: m.oxygenLevel,
      bloodSugar: m.bloodSugar,
      systolicBP: m.bloodPressure ? parseFloat(m.bloodPressure.split('/')[0] || '0') || null : null,
    }));

    const latest = metrics.length ? metrics[metrics.length - 1] : null;
    const benchmarks: Benchmark[] = [];

    const pushBenchmark = (metric: string, value: number | null | undefined, idealMin: number, idealMax: number, unit: string) => {
      if (value === null || value === undefined) return;
      const b = POPULATION_BENCHMARKS[metric];
      const percentile = Math.max(0, Math.min(100, Math.round(100 - Math.abs(value - (idealMin + idealMax) / 2) / (idealMax - idealMin) * 100)));
      let status: Benchmark['status'] = 'good';
      if (value < idealMin * 0.85 || value > idealMax * 1.15) status = 'poor';
      else if (value < idealMin || value > idealMax) status = 'warning';
      benchmarks.push({
        metric, value, unit: b?.unit || unit, percentile,
        status, ideal: `${idealMin}-${idealMax} ${unit}`,
      });
    };

    if (latest) {
      pushBenchmark('heartRate', latest.heartRate, POPULATION_BENCHMARKS.heartRate.idealMin, POPULATION_BENCHMARKS.heartRate.idealMax, 'bpm');
      pushBenchmark('oxygenLevel', latest.oxygenLevel, POPULATION_BENCHMARKS.oxygenLevel.idealMin, POPULATION_BENCHMARKS.oxygenLevel.idealMax, '%');
      pushBenchmark('bloodSugar', latest.bloodSugar, POPULATION_BENCHMARKS.bloodSugar.idealMin, POPULATION_BENCHMARKS.bloodSugar.idealMax, 'mg/dL');
      if (latest.bloodPressure) {
        const sys = parseFloat(latest.bloodPressure.split('/')[0]);
        if (!isNaN(sys)) pushBenchmark('restingBP', sys, POPULATION_BENCHMARKS.restingBP.idealMin, POPULATION_BENCHMARKS.restingBP.idealMax, 'mmHg');
      }
    }

    const healthScore = benchmarks.length
      ? Math.round(benchmarks.reduce((s, b) => s + b.percentile, 0) / benchmarks.length)
      : 0;

    return NextResponse.json({
      benchmarks,
      healthScore,
      latestDate: latest?.date || null,
      trend,
      demographicMatch: 'Compares your readings against healthy adult reference ranges.',
    });
  } catch (error) {
    console.error('Health pulse error:', error);
    return NextResponse.json({ error: 'Failed to compute health pulse' }, { status: 500 });
  }
}
