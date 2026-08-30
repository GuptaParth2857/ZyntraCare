import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'demo-user';

    const [latestMetric, latestWearable] = await Promise.all([
      prisma.healthMetric.findFirst({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.wearableData.findFirst({ where: { userId }, orderBy: { recordedAt: 'desc' } }),
    ]);

    const metrics: any[] = [{ label: 'Health Score', value: '87', status: 'normal', icon: '💚' }];

    if (latestWearable) {
      metrics.push(
        { label: 'Heart Rate', value: `${latestWearable.heartRate ?? '--'} bpm`, status: 'normal', icon: '❤️' },
        { label: 'SpO₂', value: `${latestWearable.oxygenLevel ?? '--'}%`, status: (latestWearable.oxygenLevel ?? 100) >= 95 ? 'normal' : 'warning', icon: '🫁' },
        { label: 'Steps', value: `${latestWearable.steps ?? 0}`, status: 'normal', icon: '👟' },
        { label: 'Sleep', value: `${latestWearable.sleepHours ?? '--'} hrs`, status: 'normal', icon: '😴' },
        { label: 'Blood Pressure', value: latestWearable.bloodPressure || '--', status: 'normal', icon: '🩺' },
      );
    }

    if (latestMetric) {
      metrics.push(
        { label: 'Blood Sugar', value: latestMetric.bloodSugar ? `${latestMetric.bloodSugar} mg/dL` : '--', status: 'normal', icon: '🍬' },
        { label: 'Weight', value: latestMetric.weight ? `${latestMetric.weight} kg` : '--', status: 'normal', icon: '⚖️' },
        { label: 'BMI', value: latestMetric.height && latestMetric.weight ? `${(latestMetric.weight / Math.pow(latestMetric.height / 100, 2)).toFixed(1)}` : '--', status: 'normal', icon: '📐' },
      );
    }

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('AI health coach metrics error:', error);
    return NextResponse.json({ metrics: [] });
  }
}