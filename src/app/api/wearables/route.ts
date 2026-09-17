import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

function resolveUserId(token: any, requested: string | null): string {
  if (token?.sub) return token.sub;
  if (requested === 'demo-user') return 'demo-user';
  return '';
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { searchParams } = new URL(req.url);
  const userId = resolveUserId(token, searchParams.get('userId'));

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const data = await prisma.wearableData.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ success: true, data, total: data.length, lastSync: data[0]?.recordedAt || null });
  } catch (error) {
    console.error('Wearables GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch wearable data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const body = await req.json().catch(() => ({}));
  const userId = resolveUserId(token, body.userId === 'demo-user' ? 'demo-user' : null);

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { deviceId, heartRate, bloodPressure, bloodSugar, oxygenLevel, temperature, steps, calories, sleepHours } = body;

  const hasValue = [heartRate, bloodPressure, bloodSugar, oxygenLevel, temperature, steps, calories, sleepHours]
    .some((v) => v !== undefined && v !== null && String(v) !== '');

  if (!hasValue) {
    return NextResponse.json({ error: 'At least one vitals value is required' }, { status: 400 });
  }

  try {
    const record = await prisma.wearableData.create({
      data: {
        userId,
        deviceId: deviceId || 'manual',
        heartRate: heartRate ?? null,
        bloodPressure: bloodPressure || null,
        bloodSugar: bloodSugar ?? null,
        oxygenLevel: oxygenLevel ?? null,
        temperature: temperature ?? null,
        steps: steps ?? null,
        calories: calories ?? null,
        sleepHours: sleepHours ?? null,
      },
    });
    return NextResponse.json({ success: true, record, lastSync: record.recordedAt }, { status: 201 });
  } catch (error) {
    console.error('Wearables POST error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}