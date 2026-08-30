import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = { isActive: true };

    if (category) {
      where.category = category;
    }

    const challenges = await prisma.healthChallenge.findMany({
      where,
      include: { _count: { select: { participations: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(challenges);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challengeId, userId } = body;

    if (!challengeId || !userId) {
      return NextResponse.json({ error: 'challengeId and userId are required' }, { status: 400 });
    }

    const existing = await prisma.challengeParticipation.findUnique({
      where: { challengeId_userId: { challengeId, userId } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already participating in this challenge' }, { status: 409 });
    }

    const participation = await prisma.challengeParticipation.create({
      data: { challengeId, userId },
    });

    return NextResponse.json({ success: true, participation }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
  }
}
