import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const data = await prisma.wearableData.findMany({
      where: { userId: token.id as string },
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });
    
    return NextResponse.json({ success: true, data, total: data.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wearable data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const body = await req.json();
    const record = await prisma.wearableData.create({
      data: {
        userId: token.id as string,
        deviceId: body.deviceId,
        heartRate: body.heartRate,
        bloodPressure: body.bloodPressure,
        bloodSugar: body.bloodSugar,
        oxygenLevel: body.oxygenLevel,
        temperature: body.temperature,
        steps: body.steps,
        calories: body.calories,
        sleepHours: body.sleepHours,
      },
    });
    return NextResponse.json({ success: true, record });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
