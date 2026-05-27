import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || token?.sub || '';

    if (!userId) {
      return NextResponse.json({ genomicData: null });
    }

    const genomicData = await prisma.genomicData.findUnique({
      where: { userId },
    });

    return NextResponse.json({ genomicData });
  } catch (error) {
    console.error('Genomic data GET error:', error);
    return NextResponse.json({ genomicData: null }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const genomicData = await prisma.genomicData.upsert({
      where: { userId: body.userId },
      update: {
        data: body.data || undefined,
        summary: body.summary || undefined,
        rawFileUrl: body.rawFileUrl || undefined,
        provider: body.provider || '',
        processed: body.processed || false,
      },
      create: {
        userId: body.userId,
        data: body.data || null,
        summary: body.summary || null,
        rawFileUrl: body.rawFileUrl || null,
        provider: body.provider || '',
        processed: body.processed || false,
      },
    });
    return NextResponse.json({ genomicData }, { status: 201 });
  } catch (error) {
    console.error('Genomic data POST error:', error);
    return NextResponse.json({ error: 'Failed to save genomic data' }, { status: 500 });
  }
}
