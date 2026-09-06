import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || (token?.id as string) || '';
  const status = searchParams.get('status') || '';

  try {
    if (!userId) return NextResponse.json({ goals: [] });

    const where: any = { userId };
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
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const body = await req.json();
    const userId = body.userId || (token?.id as string);
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
    const goal = await prisma.healthGoal.create({
      data: {
        userId,
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
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Goal id required' }, { status: 400 });

    const uid = body.userId || (token?.id as string);
    const existing = await prisma.healthGoal.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    if (uid && existing.userId !== uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || '';
    if (!id) {
      return NextResponse.json({ error: 'Goal id required' }, { status: 400 });
    }

    const uid = searchParams.get('userId') || (token?.id as string);
    const existing = await prisma.healthGoal.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    if (uid && existing.userId !== uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.healthGoal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Health goals DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
