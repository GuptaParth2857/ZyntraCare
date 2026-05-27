import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getPreviousHash(userId: string): Promise<string> {
  const last = await prisma.healthRecord.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true },
  });
  if (!last) return GENESIS_HASH;
  return sha256(`${last.id}-${last.createdAt.getTime()}`);
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const records = await prisma.healthRecord.findMany({
      where: { userId: token.sub },
      orderBy: { createdAt: 'desc' },
    });

    let chainHash = GENESIS_HASH;
    const chain = [];
    for (const record of records) {
      const hash = await sha256(`${record.id}-${record.createdAt.getTime()}`);
      chain.push({
        id: record.id,
        title: record.title,
        type: record.type,
        fileUrl: record.fileUrl,
        notes: record.notes,
        date: record.date,
        hospital: record.hospital,
        doctor: record.doctor,
        hash,
        previousHash: chainHash,
        timestamp: record.createdAt.getTime(),
      });
      chainHash = hash;
    }

    return NextResponse.json({ success: true, records: chain });
  } catch (error) {
    console.error('Blockchain records GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, type, fileUrl, notes, date, hospital, doctor } = body;

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    const record = await prisma.healthRecord.create({
      data: {
        userId: token.sub,
        title,
        type,
        fileUrl: fileUrl || '',
        notes: notes || '',
        date: date || new Date().toISOString().split('T')[0],
        hospital: hospital || '',
        doctor: doctor || '',
      },
    });

    const previousHash = await getPreviousHash(token.sub);
    const hash = await sha256(`${record.id}-${record.createdAt.getTime()}`);

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        title: record.title,
        type: record.type,
        fileUrl: record.fileUrl,
        notes: record.notes,
        date: record.date,
        hospital: record.hospital,
        doctor: record.doctor,
        hash,
        previousHash,
        timestamp: record.createdAt.getTime(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Blockchain records POST error:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}
