import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';

  try {
    const where: any = {};
    if (userId) where.userId = userId;

    const cycles = await prisma.womenHealthCycle.findMany({
      where,
      orderBy: { startDate: 'desc' },
      take: 12,
    });

    return NextResponse.json({ cycles });
  } catch (error) {
    console.error('Women health GET error:', error);
    return NextResponse.json({ cycles: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cycle = await prisma.womenHealthCycle.create({
      data: {
        userId: body.userId,
        startDate: body.startDate,
        endDate: body.endDate || null,
        cycleLength: body.cycleLength || 28,
        periodLength: body.periodLength || 5,
        symptoms: JSON.stringify(body.symptoms || []),
        notes: body.notes || '',
      },
    });
    return NextResponse.json({ cycle }, { status: 201 });
  } catch (error) {
    console.error('Women health POST error:', error);
    return NextResponse.json({ error: 'Failed to create cycle record' }, { status: 500 });
  }
}
