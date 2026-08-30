import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const condition = searchParams.get('condition');
    const phase = searchParams.get('phase');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (condition) where.condition = { contains: condition };
    if (phase) where.phase = phase;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { condition: { contains: search } },
        { sponsor: { contains: search } },
      ];
    }

    const trials = await prisma.clinicalTrial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(trials);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch clinical trials' }, { status: 500 });
  }
}
