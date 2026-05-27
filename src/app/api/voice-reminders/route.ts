import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';

  try {
    const where: any = {};
    if (userId) where.userId = userId;

    const reminders = await prisma.voiceReminder.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error('Voice reminders GET error:', error);
    return NextResponse.json({ reminders: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reminder = await prisma.voiceReminder.create({
      data: {
        userId: body.userId,
        title: body.title,
        message: body.message,
        scheduledAt: new Date(body.scheduledAt),
        repeatType: body.repeatType || 'none',
      },
    });
    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    console.error('Voice reminders POST error:', error);
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}
