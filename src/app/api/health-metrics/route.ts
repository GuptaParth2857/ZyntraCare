import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const metrics = await prisma.healthMetric.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
    const updatedAt = metrics.length ? metrics[metrics.length - 1].createdAt : null;
    return NextResponse.json({ metrics, updatedAt });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch health metrics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'demo-user';
    const newMetric = await prisma.healthMetric.create({
      data: {
        userId,
        date: body.date || new Date().toISOString().split('T')[0],
        bloodPressure: body.bloodPressure || '',
        heartRate: body.heartRate ?? null,
        bloodSugar: body.bloodSugar ?? null,
        weight: body.weight ?? null,
        height: body.height ?? null,
        temperature: body.temperature ?? null,
        oxygenLevel: body.oxygenLevel ?? null,
        notes: body.notes || '',
      },
    });
    return NextResponse.json({ metric: newMetric }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save health metric' }, { status: 500 });
  }
}
