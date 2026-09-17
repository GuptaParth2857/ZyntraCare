import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const TYPE_TO_CATEGORY: Record<string, string> = {
  hospital: 'visit',
  lab: 'lab',
  prescription: 'medication',
  emergency: 'emergency',
  vaccination: 'vaccination',
  vitals: 'vitals',
};

const CATEGORY_TO_TYPE: Record<string, string> = {
  visit: 'hospital',
  diagnosis: 'hospital',
  surgery: 'hospital',
  medication: 'prescription',
  prescription: 'prescription',
  lab: 'lab',
  emergency: 'emergency',
  vaccination: 'vaccination',
  vitals: 'vitals',
};

function resolveUserId(token: any, requested: string | null): string {
  if (token?.sub) return token.sub;
  if (requested === 'demo-user') return 'demo-user';
  return '';
}

function mapEvent(e: any) {
  let meta: any = {};
  try { meta = e.metadata ? JSON.parse(e.metadata) : {}; } catch {}
  return {
    id: e.id,
    type: CATEGORY_TO_TYPE[e.category] || 'hospital',
    title: e.title,
    date: e.date,
    hospital: e.hospital || '',
    doctor: e.doctor || '',
    summary: e.description || e.title,
    details: e.description || '',
    location: meta.location || '',
  };
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { searchParams } = new URL(req.url);
  const userId = resolveUserId(token, searchParams.get('userId'));
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const events = await prisma.healthTimelineEvent.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ events: events.map(mapEvent) });
  } catch (error) {
    console.error('Health timeline GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline events' }, { status: 500 });
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

  const title = String(body.title || '').trim().slice(0, 200);
  const date = String(body.date || '').slice(0, 10);
  if (!title || !date) {
    return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
  }
  const type = String(body.type || 'hospital');
  const category = TYPE_TO_CATEGORY[type] || 'visit';

  try {
    const event = await prisma.healthTimelineEvent.create({
      data: {
        userId,
        title,
        category,
        date,
        hospital: String(body.hospital || '').slice(0, 200),
        doctor: String(body.doctor || '').slice(0, 200),
        description: String(body.summary || body.details || '').slice(0, 2000),
        attachments: '[]',
        metadata: JSON.stringify({}),
      },
    });
    return NextResponse.json({ success: true, event: mapEvent(event) }, { status: 201 });
  } catch (error) {
    console.error('Health timeline POST error:', error);
    return NextResponse.json({ error: 'Failed to create timeline event' }, { status: 500 });
  }
}