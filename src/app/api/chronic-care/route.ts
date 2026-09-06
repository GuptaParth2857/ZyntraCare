import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const plans = await prisma.carePlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Chronic care fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch care plans' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'demo-user';
    const plan = await prisma.carePlan.create({
      data: {
        userId,
        condition: body.condition || 'other',
        title: body.title || 'Care Plan',
        description: body.description || '',
        goals: body.goals ? JSON.stringify(body.goals) : '[]',
        schedule: body.schedule ? JSON.stringify(body.schedule) : '[]',
        milestones: body.milestones ? JSON.stringify(body.milestones) : '[]',
        status: body.status || 'active',
        startDate: body.startDate || new Date().toISOString().split('T')[0],
        endDate: body.endDate || null,
      },
    });
    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error('Chronic care create error:', error);
    return NextResponse.json({ error: 'Failed to create care plan' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await prisma.carePlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chronic care delete error:', error);
    return NextResponse.json({ error: 'Failed to delete care plan' }, { status: 500 });
  }
}
