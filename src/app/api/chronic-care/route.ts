import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const VALID_CONDITIONS = ['diabetes', 'hypertension', 'thyroid', 'cardiac', 'asthma', 'other'];

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
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const body = await req.json().catch(() => ({}));
  const requested = String(body.userId || '');
  const userId = resolveUserId(token, requested === 'demo-user' ? 'demo-user' : null);
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const condition = String(body.condition || 'other');
  if (!VALID_CONDITIONS.includes(condition)) {
    return NextResponse.json({ error: 'Invalid condition' }, { status: 400 });
  }
  const title = String(body.title || '').trim().slice(0, 120);
  if (!title) {
    return NextResponse.json({ error: 'Plan title is required' }, { status: 400 });
  }
  const description = String(body.description || '').trim().slice(0, 1000);

  try {
    const plan = await prisma.carePlan.create({
      data: {
        userId,
        condition,
        title,
        description,
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
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const userId = resolveUserId(token, searchParams.get('userId'));
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const existing = await prisma.carePlan.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Care plan not found' }, { status: 404 });
    }
    await prisma.carePlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chronic care delete error:', error);
    return NextResponse.json({ error: 'Failed to delete care plan' }, { status: 500 });
  }
}