import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;

    const claims = await prisma.insuranceClaim.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(claims);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId, policyId, hospitalName, treatmentType, claimAmount,
      diagnosis, treatmentDate, documents, notes,
    } = body;

    if (!userId || !hospitalName || !treatmentType || !claimAmount || !treatmentDate) {
      return NextResponse.json({ error: 'userId, hospitalName, treatmentType, claimAmount, and treatmentDate are required' }, { status: 400 });
    }

    const claimNumber = `CLM-${Date.now()}`;

    const claim = await prisma.insuranceClaim.create({
      data: {
        userId,
        policyId: policyId || null,
        hospitalName,
        treatmentType,
        claimAmount: parseFloat(claimAmount),
        diagnosis: diagnosis || '',
        treatmentDate,
        claimNumber,
        documents: JSON.stringify(documents || []),
        notes: notes || '',
      },
    });

    return NextResponse.json({ success: true, claim }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 });
  }
}
