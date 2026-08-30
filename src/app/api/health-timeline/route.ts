import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const events = await prisma.healthTimelineEvent.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch timeline events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, description, category, date, hospital, doctor, attachments, metadata } = body;

    if (!userId || !title || !date) {
      return NextResponse.json({ error: 'userId, title, and date are required' }, { status: 400 });
    }

    const event = await prisma.healthTimelineEvent.create({
      data: {
        userId,
        title,
        description: description || '',
        category: category || 'visit',
        date,
        hospital: hospital || '',
        doctor: doctor || '',
        attachments: JSON.stringify(attachments || []),
        metadata: JSON.stringify(metadata || {}),
      },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create timeline event' }, { status: 500 });
  }
}
