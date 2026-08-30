import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get('hospitalId');
    const status = searchParams.get('status');

    if (!hospitalId) {
      return NextResponse.json({ error: 'hospitalId is required' }, { status: 400 });
    }

    const where: Record<string, unknown> = { hospitalId };
    if (status) where.status = status;

    const entries = await prisma.queueEntry.findMany({
      where,
      orderBy: { joinedAt: 'asc' },
    });

    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch queue entries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hospitalId, userId, patientName, department, priority } = body;

    if (!hospitalId || !patientName || !department) {
      return NextResponse.json({ error: 'hospitalId, patientName, and department are required' }, { status: 400 });
    }

    const lastEntry = await prisma.queueEntry.findFirst({
      where: { hospitalId, department },
      orderBy: { queueNumber: 'desc' },
    });

    const queueNumber = (lastEntry?.queueNumber || 0) + 1;

    const entry = await prisma.queueEntry.create({
      data: {
        hospitalId,
        userId: userId || null,
        patientName,
        department,
        queueNumber,
        priority: priority || 'normal',
      },
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to join queue' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };

    if (status === 'in_progress') {
      updateData.servedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const entry = await prisma.queueEntry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, entry });
  } catch {
    return NextResponse.json({ error: 'Failed to update queue entry' }, { status: 500 });
  }
}
