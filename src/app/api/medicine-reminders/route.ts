import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function resolveUserId(token: any, requested: string | null): string {
  if (token?.sub) return token.sub;
  if (requested === 'demo-user') return 'demo-user';
  return '';
}

function safeJson(raw: string | null, fallback: string[] = []): string[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x: any) => typeof x === 'string') : fallback;
  } catch {
    return fallback;
  }
}

function mapReminder(r: any) {
  const times = safeJson(r.times);
  const days = safeJson(r.days);
  return {
    id: r.id,
    medicineName: r.medicine,
    dosage: r.dosage,
    frequency: r.frequency,
    times,
    days,
    enabled: r.isActive,
    startDate: r.startDate,
    notes: r.notes,
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
    const reminders = await prisma.medicineReminder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ reminders: reminders.map(mapReminder) });
  } catch (error) {
    console.error('Medicine reminders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
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

  const medicine = String(body.medicine || '').trim().slice(0, 120);
  if (!medicine) {
    return NextResponse.json({ error: 'Medicine name is required' }, { status: 400 });
  }
  const times = Array.isArray(body.times) ? body.times.map(String).filter(Boolean).slice(0, 8) : [];
  if (times.length === 0) {
    return NextResponse.json({ error: 'At least one reminder time is required' }, { status: 400 });
  }
  const days = Array.isArray(body.days) ? body.days.map(String).filter((d: string) => DAYS.includes(d)).slice(0, 7) : [];
  const dosage = String(body.dosage || '').trim().slice(0, 60);
  const startDate = String(body.startDate || new Date().toISOString().split('T')[0]).slice(0, 10);

  try {
    const reminder = await prisma.medicineReminder.create({
      data: {
        userId,
        medicine,
        dosage,
        frequency: String(body.frequency || 'daily').slice(0, 20),
        times: JSON.stringify(times),
        days: JSON.stringify(days),
        startDate,
        endDate: body.endDate ? String(body.endDate).slice(0, 10) : null,
        notes: String(body.notes || '').slice(0, 500),
      },
    });
    return NextResponse.json({ reminder: mapReminder(reminder) }, { status: 201 });
  } catch (error) {
    console.error('Medicine reminders POST error:', error);
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { searchParams } = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || searchParams.get('id') || '');
  if (!id) {
    return NextResponse.json({ error: 'Missing reminder id' }, { status: 400 });
  }
  const userId = resolveUserId(token, searchParams.get('userId') === 'demo-user' ? 'demo-user' : null);
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const existing = await prisma.medicineReminder.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    const data: any = {};
    if (body.medicine !== undefined) data.medicine = String(body.medicine).trim().slice(0, 120);
    if (body.dosage !== undefined) data.dosage = String(body.dosage).trim().slice(0, 60);
    if (body.frequency !== undefined) data.frequency = String(body.frequency).slice(0, 20);
    if (body.times !== undefined) {
      const times = Array.isArray(body.times) ? body.times.map(String).filter(Boolean).slice(0, 8) : [];
      if (times.length === 0) {
        return NextResponse.json({ error: 'At least one reminder time is required' }, { status: 400 });
      }
      data.times = JSON.stringify(times);
    }
    if (body.days !== undefined) {
      data.days = JSON.stringify(
        Array.isArray(body.days) ? body.days.map(String).filter((d: string) => DAYS.includes(d)).slice(0, 7) : []
      );
    }
    if (body.startDate !== undefined) data.startDate = String(body.startDate).slice(0, 10);
    if (body.endDate !== undefined) data.endDate = body.endDate ? String(body.endDate).slice(0, 10) : null;
    if (body.notes !== undefined) data.notes = String(body.notes).slice(0, 500);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const reminder = await prisma.medicineReminder.update({ where: { id }, data });
    return NextResponse.json({ reminder: mapReminder(reminder) });
  } catch (error) {
    console.error('Medicine reminders PUT error:', error);
    return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing reminder id' }, { status: 400 });
  }
  const userId = resolveUserId(token, searchParams.get('userId'));
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const existing = await prisma.medicineReminder.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }
    await prisma.medicineReminder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Medicine reminders DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 });
  }
}