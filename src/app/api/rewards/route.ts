import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || token?.sub || '';

    if (!userId) {
      return NextResponse.json({ rewards: [], totalPoints: 0 });
    }

    const rewards = await prisma.reward.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const totalPoints = rewards.reduce((sum, r) => sum + r.points, 0);

    return NextResponse.json({ rewards, totalPoints });
  } catch (error) {
    console.error('Rewards GET error:', error);
    return NextResponse.json({ rewards: [], totalPoints: 0 }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reward = await prisma.reward.create({
      data: {
        userId: body.userId,
        points: body.points,
        source: body.source || 'general',
        description: body.description || '',
      },
    });
    return NextResponse.json({ reward }, { status: 201 });
  } catch (error) {
    console.error('Rewards POST error:', error);
    return NextResponse.json({ error: 'Failed to create reward' }, { status: 500 });
  }
}
