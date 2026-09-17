import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { verifyChain, backfillMissingHashes, contentValue, sha256 } from '@/lib/blockchain';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = token.sub;
    await backfillMissingHashes(userId);
    const { records, links, chainValid } = await verifyChain(userId);

    const chain = links.map(({ record, link }) => ({
      id: record.id,
      title: record.title,
      type: record.type,
      fileUrl: record.fileUrl,
      notes: record.notes,
      date: record.date,
      hospital: record.hospital,
      doctor: record.doctor,
      hash: link.hash,
      previousHash: link.previousHash,
      timestamp: record.createdAt.getTime(),
      verified: link.storedHash === link.hash && link.storedPreviousHash === link.previousHash,
    }));

    return NextResponse.json({ success: true, records: chain, chainValid, totalRecords: records.length });
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

    await backfillMissingHashes(token.sub);
    const { links } = await verifyChain(token.sub);
    const link = links.find((l) => l.record.id === record.id);

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
        hash: link?.link.hash,
        previousHash: link?.link.previousHash,
        timestamp: record.createdAt.getTime(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Blockchain records POST error:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}