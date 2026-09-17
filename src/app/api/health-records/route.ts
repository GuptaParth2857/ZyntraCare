import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { rechainAllHashes } from '@/lib/blockchain';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['report', 'prescription', 'scan', 'vaccination'];
const MAX_BASE64_CHARS = 5_000_000; // ~3.7 MB decoded payload

function resolveUserId(token: any, requested: string | null): string {
  if (token?.sub) return token.sub;
  if (requested === 'demo-user') return 'demo-user';
  return '';
}

function fileSizeFromUrl(fileUrl: string): string {
  if (!fileUrl) return '—';
  const m = fileUrl.match(/^data:[^;]+;base64,(.*)$/s);
  if (!m) return '—';
  const bytes = Math.round((m[1].length * 3) / 4);
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes > 0) return `${Math.round(bytes / 1024)} KB`;
  return '—';
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { searchParams } = new URL(req.url);
  const userId = resolveUserId(token, searchParams.get('userId'));
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const type = searchParams.get('type') || '';

  try {
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
      hasFile: !!r.fileUrl && r.fileUrl.startsWith('data:'),
      fileSize: fileSizeFromUrl(r.fileUrl),
    }));

    return NextResponse.json({ records: mapped });
  } catch (error) {
    console.error('Health records error:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const body = await req.json().catch(() => ({}));
  const requested = String(body.userId || '');
  const userId = resolveUserId(token, requested === 'demo-user' ? 'demo-user' : null);
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { title, type, date, hospital, doctor, fileUrl } = body;
  if (!title || !type || !date) {
    return NextResponse.json({ error: 'title, type, and date are required' }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid record type' }, { status: 400 });
  }

  let payload = typeof fileUrl === 'string' ? fileUrl.trim() : '';
  if (payload) {
    if (!payload.startsWith('data:')) {
      return NextResponse.json({ error: 'Invalid file payload' }, { status: 400 });
    }
    if (payload.length > MAX_BASE64_CHARS) {
      return NextResponse.json({ error: 'File too large (max ~3.5 MB)' }, { status: 413 });
    }
  }

  try {
    const record = await prisma.healthRecord.create({
      data: {
        userId,
        title: String(title).slice(0, 200),
        type,
        date: String(date),
        hospital: String(hospital || ''),
        doctor: String(doctor || ''),
        fileUrl: payload,
        notes: '',
      },
    });
    await rechainAllHashes(userId);
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error('Create health record error:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const authUserId = resolveUserId(token, null);
  if (!authUserId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  try {
    const existing = await prisma.healthRecord.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    if (existing.userId !== authUserId) {
      return NextResponse.json({ error: 'You can only delete your own records' }, { status: 403 });
    }
    await prisma.healthRecord.delete({ where: { id } });
    await rechainAllHashes(authUserId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete health record error:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}