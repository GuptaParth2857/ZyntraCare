import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const medicine = searchParams.get('medicine');

    if (!medicine) {
      return NextResponse.json({ error: 'medicine query parameter is required' }, { status: 400 });
    }

    const interactions = await prisma.medicineInteraction.findMany({
      where: {
        OR: [
          { medicine1: { contains: medicine } },
          { medicine2: { contains: medicine } },
        ],
      },
      orderBy: { severity: 'asc' },
    });

    return NextResponse.json(interactions);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch medicine interactions' }, { status: 500 });
  }
}
