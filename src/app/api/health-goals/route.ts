import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';
  const status = searchParams.get('status') || '';

  try {
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const goals = await prisma.healthGoal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Health goals GET error:', error);
    return NextResponse.json({ goals: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const goal = await prisma.healthGoal.create({
      data: {
        userId: body.userId,
        title: body.title,
        description: body.description || '',
        type: body.type,
        targetValue: body.targetValue || null,
        currentValue: body.currentValue || 0,
        unit: body.unit || '',
        startDate: body.startDate,
        endDate: body.endDate || null,
      },
    });
    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Health goals POST error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const goal = await prisma.healthGoal.update({
      where: { id },
      data,
    });
    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Health goals PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}
