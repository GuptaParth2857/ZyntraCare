import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const where = userId ? { userId } : {};
    const alerts = await prisma.bedAlert.findMany({ where, orderBy: { createdAt: 'desc' } });

    return NextResponse.json({ success: true, alerts });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, hospitalId, hospitalName, alertType, targetAvailability } = body;

    if (!userId || !hospitalId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await prisma.bedAlert.findFirst({
      where: { userId, hospitalId, alertType: alertType || 'any', notified: false },
    });

    const alertData = {
      userId,
      hospitalId,
      hospitalName: hospitalName || 'Hospital',
      alertType: alertType || 'any',
      targetAvailability: targetAvailability ? parseInt(targetAvailability, 10) : 1,
    };

    let alert;
    if (existing) {
      alert = await prisma.bedAlert.update({
        where: { id: existing.id },
        data: alertData,
      });
    } else {
      alert = await prisma.bedAlert.create({ data: alertData });
    }

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const alertId = searchParams.get('alertId');
    const userId = searchParams.get('userId');

    if (alertId) {
      await prisma.bedAlert.delete({ where: { id: alertId } });
    } else if (userId) {
      await prisma.bedAlert.deleteMany({ where: { userId } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete alerts' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { hospitalId, alertType, available, icuAvailable } = body;

    const where: any = { hospitalId, notified: false };
    if (alertType) where.alertType = alertType;

    const alerts = await prisma.bedAlert.findMany({ where });

    const toNotify = alerts.filter((a) =>
      a.alertType === 'icu'
        ? (icuAvailable || 0) >= a.targetAvailability
        : (available || 0) >= a.targetAvailability
    );

    const ids = toNotify.map((a) => a.id);

    if (ids.length > 0) {
      await prisma.bedAlert.updateMany({
        where: { id: { in: ids } },
        data: { notified: true },
      });
    }

    return NextResponse.json({
      success: true,
      notified: ids,
      count: ids.length,
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
