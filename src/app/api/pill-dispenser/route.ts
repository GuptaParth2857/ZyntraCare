import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (action === 'schedule') {
      const dispenserId = searchParams.get('dispenserId');
      if (!dispenserId) {
        return NextResponse.json({ error: 'dispenserId is required for schedule' }, { status: 400 });
      }
      const schedules = await prisma.pillSchedule.findMany({
        where: { dispenserId, isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(schedules);
    }

    if (action === 'logs') {
      const dispenserId = searchParams.get('dispenserId');
      if (!dispenserId) {
        return NextResponse.json({ error: 'dispenserId is required for logs' }, { status: 400 });
      }
      const logs = await prisma.dispenseLog.findMany({
        where: { dispenserId },
        orderBy: { dispensedAt: 'desc' },
        take: 50,
      });
      return NextResponse.json(logs);
    }

    const dispensers = await prisma.pillDispenser.findMany({
      where: { userId },
      include: { schedules: true, dispenseLogs: { take: 5, orderBy: { dispensedAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(dispensers);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dispensers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'schedule') {
      const { dispenserId, medicineName, dosage, compartment, times, daysOfWeek, startDate, endDate } = body;
      if (!dispenserId || !medicineName || !dosage || !compartment) {
        return NextResponse.json({ error: 'dispenserId, medicineName, dosage, and compartment are required' }, { status: 400 });
      }
      const schedule = await prisma.pillSchedule.create({
        data: {
          dispenserId,
          medicineName,
          dosage,
          compartment: parseInt(compartment, 10),
          times: JSON.stringify(times || []),
          daysOfWeek: JSON.stringify(daysOfWeek || [1, 2, 3, 4, 5, 6, 7]),
          startDate: startDate || new Date().toISOString().split('T')[0],
          endDate: endDate || null,
        },
      });
      return NextResponse.json({ success: true, schedule }, { status: 201 });
    }

    if (action === 'dispense') {
      const { dispenserId, medicine, dosage, compartment, status } = body;
      if (!dispenserId || !medicine || !compartment) {
        return NextResponse.json({ error: 'dispenserId, medicine, and compartment are required' }, { status: 400 });
      }
      const log = await prisma.dispenseLog.create({
        data: {
          dispenserId,
          medicine,
          dosage: dosage || '',
          compartment: parseInt(compartment, 10),
          status: status || 'dispensed',
        },
      });
      return NextResponse.json({ success: true, log }, { status: 201 });
    }

    const { userId, deviceName, deviceCode } = body;
    if (!userId || !deviceName) {
      return NextResponse.json({ error: 'userId and deviceName are required' }, { status: 400 });
    }

    const dispenser = await prisma.pillDispenser.create({
      data: {
        userId,
        deviceName,
        deviceCode: deviceCode || '',
      },
    });

    return NextResponse.json({ success: true, dispenser }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
