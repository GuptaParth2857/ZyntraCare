import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function resolveUserId(token: any, requested: string | null): string {
  if (token?.sub) return token.sub;
  if (requested === 'demo-user') return 'demo-user';
  return '';
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateOffsetStr(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysOffset);
  return d.toISOString().slice(0, 10);
}

function parseTimes(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

function baseName(name: string): string {
  const cleaned = name.replace(/\s*\d+(mg|mcg|ml|g|iu|k)\b/gi, '').trim();
  return cleaned || name;
}

function mapMedicine(med: any) {
  const logs = med.logs || [];
  const taken = logs.filter((l: any) => l.status === 'taken').length;
  const missed = logs.filter((l: any) => l.status === 'missed').length;
  const total = taken + missed;
  const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;
  const dosesPerDay = Math.max(1, parseTimes(med.times).length);
  const nextRefillDays = Math.max(0, Math.ceil(med.remainingDoses / dosesPerDay));
  return {
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    times: parseTimes(med.times),
    startDate: med.startDate,
    endDate: med.endDate,
    remainingDoses: med.remainingDoses,
    totalDoses: med.totalDoses,
    adherenceRate,
    loggedTaken: taken,
    loggedMissed: missed,
    autoReorder: med.autoReorder,
    reorderThreshold: med.reorderThreshold,
    stockLevel: med.stockLevel,
    lowStock: med.stockLevel <= med.reorderThreshold,
    dosesPerDay,
    nextRefill: nextRefillDays === 0 ? 'Due now' : `In ${nextRefillDays} day${nextRefillDays === 1 ? '' : 's'}`,
  };
}

async function computeSummary(medicines: any[], userId: string) {
  const logs = medicines.flatMap((m: any) => m.logs);
  const today = todayStr();

  const takenToday = logs.filter((l: any) => l.date === today && l.status === 'taken').length;
  const missedToday = logs.filter((l: any) => l.date === today && l.status === 'missed').length;
  const scheduledToday = medicines.reduce((s: number, m: any) => s + Math.max(1, parseTimes(m.times).length), 0);

  const byDate = new Map<string, { taken: number; missed: number }>();
  for (const l of logs) {
    const key = l.date;
    if (!key) continue;
    const entry = byDate.get(key) || { taken: 0, missed: 0 };
    if (l.status === 'taken') entry.taken += 1;
    if (l.status === 'missed') entry.missed += 1;
    byDate.set(key, entry);
  }

  let streak = 0;
  for (let offset = 0; offset < 365; offset++) {
    const day = byDate.get(dateOffsetStr(offset)) || { taken: 0, missed: 0 };
    if (offset === 0) {
      if (day.missed > 0) break;
      streak += 1;
    } else {
      if (day.taken === 0 || day.missed > 0) break;
      streak += 1;
    }
  }

  const start30 = dateOffsetStr(30);
  const recent = logs.filter((l: any) => l.date >= start30);
  const recentTaken = recent.filter((l: any) => l.status === 'taken').length;
  const recentMissed = recent.filter((l: any) => l.status === 'missed').length;
  const overallScore = recentTaken + recentMissed > 0
    ? Math.round((recentTaken / (recentTaken + recentMissed)) * 100)
    : 0;

  const history: { week: string; adherenceRate: number; taken: number; missed: number }[] = [];
  for (let w = 6; w >= 1; w--) {
    const end = dateOffsetStr((w - 1) * 7);
    const start = dateOffsetStr(w * 7 - 1);
    const bucket = logs.filter((l: any) => l.date >= start && l.date <= end);
    const t = bucket.filter((l: any) => l.status === 'taken').length;
    const mn = bucket.filter((l: any) => l.status === 'missed').length;
    history.push({
      week: `Week ${7 - w}`,
      adherenceRate: t + mn > 0 ? Math.round((t / (t + mn)) * 100) : 0,
      taken: t,
      missed: mn,
    });
  }

  const names = medicines.map((m: any) => m.name);
  const interactions: { id: string; medicineA: string; medicineB: string; severity: string; message: string }[] = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = baseName(names[i]);
      const b = baseName(names[j]);
      const rows = await prisma.medicineInteraction.findMany({
        where: {
          OR: [
            { medicine1: { contains: a }, medicine2: { contains: b } },
            { medicine1: { contains: b }, medicine2: { contains: a } },
          ],
        },
      });
      for (const r of rows) {
        interactions.push({
          id: r.id,
          medicineA: names[i],
          medicineB: names[j],
          severity: r.severity.toLowerCase(),
          message: `${r.description} ${r.recommendation ? `(${r.recommendation})` : ''}`,
        });
      }
    }
  }

  return { overallScore, streak, takenToday, missedToday, scheduledToday, history, interactions };
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { searchParams } = new URL(req.url);
  const userId = resolveUserId(token, searchParams.get('userId'));
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const medicines = await prisma.medicationAdherence.findMany({
      where: { userId, isActive: true },
      include: { logs: true },
      orderBy: { createdAt: 'asc' },
    });

    const summary = await computeSummary(medicines, userId);
    return NextResponse.json({
      medicines: medicines.map(mapMedicine),
      overallScore: summary.overallScore,
      streak: summary.streak,
      today: {
        taken: summary.takenToday,
        missed: summary.missedToday,
        scheduled: summary.scheduledToday,
        rate: summary.scheduledToday > 0
          ? Math.round((summary.takenToday / summary.scheduledToday) * 100)
          : 0,
      },
      history: summary.history,
      interactions: summary.interactions,
    });
  } catch (error) {
    console.error('Medication adherence GET error:', error);
    return NextResponse.json({ error: 'Failed to load adherence data' }, { status: 500 });
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

  const action = String(body.action || 'create');
  try {
    if (action === 'create') {
      const name = String(body.name || '').trim().slice(0, 120);
      if (!name) {
        return NextResponse.json({ error: 'Medicine name is required' }, { status: 400 });
      }
      const times = Array.isArray(body.times)
        ? body.times.map(String).filter((t: string) => /^\d{1,2}:\d{2}$/.test(t)).slice(0, 6)
        : ['08:00'];
      const created = await prisma.medicationAdherence.create({
        data: {
          userId,
          name,
          dosage: String(body.dosage || '').slice(0, 60),
          frequency: String(body.frequency || '').slice(0, 60),
          times: JSON.stringify(times),
          startDate: String(body.startDate || todayStr()).slice(0, 10),
          endDate: String(body.endDate || '').slice(0, 10),
          totalDoses: Number(body.totalDoses) || 30,
          remainingDoses: Number(body.remainingDoses) || 30,
          stockLevel: Number(body.stockLevel) || 30,
          autoReorder: Boolean(body.autoReorder),
          reorderThreshold: Math.max(1, Math.min(99, Number(body.reorderThreshold) || 10)),
        },
        include: { logs: true },
      });
      return NextResponse.json({ success: true, medicine: mapMedicine(created) }, { status: 201 });
    }

    if (action === 'log') {
      const id = String(body.adherenceId || '');
      const status = String(body.status || '');
      if (!id) return NextResponse.json({ error: 'adherenceId is required' }, { status: 400 });
      if (status !== 'taken' && status !== 'missed') {
        return NextResponse.json({ error: 'status must be taken or missed' }, { status: 400 });
      }
      const med = await prisma.medicationAdherence.findUnique({ where: { id } });
      if (!med || med.userId !== userId) {
        return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
      }
      const date = String(body.date || todayStr()).slice(0, 10);

      await prisma.medicationDoseLog.create({
        data: { adherenceId: id, userId, date, status, doses: Math.max(1, Number(body.doses) || 1) },
      });
      if (status === 'taken') {
        await prisma.medicationAdherence.update({
          where: { id },
          data: { remainingDoses: Math.max(0, med.remainingDoses - 1) },
        });
      }

      const medicines = await prisma.medicationAdherence.findMany({
        where: { userId, isActive: true },
        include: { logs: true },
        orderBy: { createdAt: 'asc' },
      });
      const summary = await computeSummary(medicines, userId);
      return NextResponse.json({
        success: true,
        medicines: medicines.map(mapMedicine),
        overallScore: summary.overallScore,
        streak: summary.streak,
        today: {
          taken: summary.takenToday,
          missed: summary.missedToday,
          scheduled: summary.scheduledToday,
          rate: summary.scheduledToday > 0
            ? Math.round((summary.takenToday / summary.scheduledToday) * 100)
            : 0,
        },
        history: summary.history,
      });
    }

    if (action === 'reorder') {
      const id = String(body.adherenceId || '');
      if (!id) return NextResponse.json({ error: 'adherenceId is required' }, { status: 400 });
      const med = await prisma.medicationAdherence.findUnique({ where: { id } });
      if (!med || med.userId !== userId) {
        return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
      }
      const trackingId = `ZYN-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const order = await prisma.medicineOrder.create({
        data: {
          userId,
          trackingId,
          items: JSON.stringify([{ name: med.name, dosage: med.dosage, frequency: med.frequency, quantity: 1, price: 0 }]),
          pharmacy: JSON.stringify({ name: 'ZyntraCare Pharmacy', address: '', deliveryTime: '~24-48h', deliveryFee: 0 }),
          address: 'Shipping details to be confirmed on E-Prescription',
          total: 0,
          payment: 'cod',
          status: 'placed',
        },
      });
      await prisma.medicationAdherence.update({ where: { id }, data: { stockLevel: med.remainingDoses } });
      return NextResponse.json({ success: true, order: { id: order.id, trackingId } });
    }

    if (action === 'toggleAutoReorder') {
      const id = String(body.adherenceId || '');
      if (!id) return NextResponse.json({ error: 'adherenceId is required' }, { status: 400 });
      const med = await prisma.medicationAdherence.findUnique({ where: { id } });
      if (!med || med.userId !== userId) {
        return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
      }
      const updated = await prisma.medicationAdherence.update({
        where: { id },
        data: { autoReorder: !med.autoReorder },
        include: { logs: true },
      });
      return NextResponse.json({ success: true, medicine: mapMedicine(updated) });
    }

    if (action === 'delete') {
      const id = String(body.adherenceId || '');
      if (!id) return NextResponse.json({ error: 'adherenceId is required' }, { status: 400 });
      const deleted = await prisma.medicationAdherence.deleteMany({
        where: { id, userId },
      });
      if (deleted.count === 0) {
        return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Medication adherence POST error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}