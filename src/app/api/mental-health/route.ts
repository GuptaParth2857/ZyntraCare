import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const entries = await prisma.mentalHealthEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch mental health entries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId, date, mood, anxiety, sleepHours, sleepQuality,
      stressLevel, notes, activities, screeningType, screeningScore, screeningAnswers,
    } = body;

    if (!userId || !date || mood === undefined) {
      return NextResponse.json({ error: 'userId, date, and mood are required' }, { status: 400 });
    }

    const entry = await prisma.mentalHealthEntry.create({
      data: {
        userId,
        date,
        mood: parseInt(mood, 10),
        anxiety: anxiety || 0,
        sleepHours: sleepHours || null,
        sleepQuality: sleepQuality || null,
        stressLevel: stressLevel || 0,
        notes: notes || '',
        activities: JSON.stringify(activities || []),
        screeningType: screeningType || '',
        screeningScore: screeningScore || null,
        screeningAnswers: JSON.stringify(screeningAnswers || []),
      },
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create mental health entry' }, { status: 500 });
  }
}
