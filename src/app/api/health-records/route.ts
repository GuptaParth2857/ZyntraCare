import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const type = searchParams.get('type') || '';

    const records = await prisma.healthRecord.findMany({
      where: { userId, ...(type ? { type } : {}) },
      orderBy: { date: 'desc' },
    });

    const mapped = records.map(r => ({
      id: r.id,
      title: r.title,
      recordType: r.type,
      date: r.date,
      hospitalName: r.hospital,
      doctorName: r.doctor,
      fileUrl: r.fileUrl,
      fileSize: r.notes || 'Encrypted',
    }));

    return NextResponse.json({ records: mapped });
  } catch (error) {
    console.error('Health records error:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, type, date, hospital, doctor, fileUrl, notes } = body;
    if (!userId || !title || !type || !date) {
      return NextResponse.json({ error: 'userId, title, type, and date are required' }, { status: 400 });
    }
    const record = await prisma.healthRecord.create({
      data: { userId, title, type, date, hospital: hospital || '', doctor: doctor || '', fileUrl: fileUrl || '', notes: notes || '' },
    });
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error('Create health record error:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    await prisma.healthRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete health record error:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}