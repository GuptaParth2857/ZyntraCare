import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '7');

  try {
    if (!userId) {
      return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString(), metrics: [], source: 'database' });
    }

    const metrics = await prisma.healthMetric.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      metrics: metrics.map(m => ({
        date: m.date,
        bloodPressure: m.bloodPressure,
        heartRate: m.heartRate,
        bloodSugar: m.bloodSugar,
        weight: m.weight,
        temperature: m.temperature,
        oxygenLevel: m.oxygenLevel,
      })),
      source: 'database',
    });
  } catch (error) {
    console.error('Health API error:', error);
    return NextResponse.json({ metrics: [], source: 'error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, date, bloodPressure, heartRate, bloodSugar, weight, height, temperature, oxygenLevel, notes } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const metric = await prisma.healthMetric.create({
      data: {
        userId,
        date: date || new Date().toISOString().split('T')[0],
        bloodPressure: bloodPressure || '',
        heartRate: heartRate || null,
        bloodSugar: bloodSugar || null,
        weight: weight || null,
        height: height || null,
        temperature: temperature || null,
        oxygenLevel: oxygenLevel || null,
        notes: notes || '',
      },
    });

    return NextResponse.json({
      message: 'Health metric saved',
      metric: {
        id: metric.id,
        date: metric.date,
        bloodPressure: metric.bloodPressure,
        heartRate: metric.heartRate,
        bloodSugar: metric.bloodSugar,
      },
    });
  } catch (error) {
    console.error('Health POST error:', error);
    return NextResponse.json({ error: 'Failed to save health data' }, { status: 500 });
  }
}
