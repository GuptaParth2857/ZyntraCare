import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function fmtTiming(minutes: number): string | null {
  if (minutes >= 1380) return '24hr';
  if (minutes >= 55 && minutes <= 90) return '1hr';
  if (minutes >= 20 && minutes <= 45) return '30min';
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'demo-user';

    const [appointments, reminders, notifications] = await Promise.all([
      prisma.appointment.findMany({
        where: { userId },
        include: { hospital: true },
        orderBy: { date: 'asc' },
      }),
      prisma.appointmentReminder.findMany({
        where: { userId, isActive: true },
        orderBy: { dateTime: 'asc' },
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 25,
      }),
    ]);

    const reminderByAppt = new Map<string, typeof reminders[number]>();
    reminders.forEach(r => { if (r.appointmentId) reminderByAppt.set(r.appointmentId, r); });

    const mappedAppointments = appointments.map(a => {
      const rem = reminderByAppt.get(a.id);
      const timing = rem ? fmtTiming(rem.reminderBefore) : null;
      return {
        id: a.id,
        hospital: a.hospital?.name || '',
        hospitalShort: (a.hospital?.name || '').split(' ').slice(0, 2).join(' '),
        doctor: a.doctorName,
        specialty: a.specialty,
        date: a.date,
        time: a.time,
        type: a.isOnline ? 'Video' : 'In-Person',
        status: a.status === 'completed' ? 'completed' : a.status === 'cancelled' ? 'cancelled' : 'upcoming',
        reminderEnabled: !!rem && !!timing,
        reminderTimings: timing ? [timing] : [],
        reminderMethods: rem ? ['In-app'] : [],
      };
    });

    const mappedNotifications: Notification[] = [
      ...reminders.map(r => ({
        id: `rem-${r.id}`,
        appointmentId: r.appointmentId || '',
        title: r.title,
        message: r.notes || 'Your appointment reminder is due.',
        time: r.dateTime,
        read: r.isRead,
        type: 'reminder' as const,
      })),
      ...notifications.map(n => ({
        id: `not-${n.id}`,
        appointmentId: '',
        title: n.title,
        message: n.message,
        time: n.createdAt ? n.createdAt.toISOString().split('.')[0].replace('T', ' ') : '',
        read: n.read,
        type: (n.type === 'warning' || n.type === 'emergency' ? 'cancelled' : n.type === 'success' ? 'update' : 'reminder') as 'reminder' | 'update' | 'cancelled',
      })),
    ];

    return NextResponse.json({ appointments: mappedAppointments, notifications: mappedNotifications });
  } catch {
    return NextResponse.json({ appointments: [], notifications: [] });
  }
}

interface Notification {
  id: string;
  appointmentId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'reminder' | 'update' | 'cancelled';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, appointmentId, title, dateTime, location, reminderBefore, type, notes } = body;

    if (!userId || !title || !dateTime) {
      return NextResponse.json({ error: 'userId, title, and dateTime are required' }, { status: 400 });
    }

    const reminder = await prisma.appointmentReminder.create({
      data: {
        userId,
        appointmentId: appointmentId || null,
        title,
        dateTime,
        location: location || '',
        reminderBefore: reminderBefore || 60,
        type: type || 'appointment',
        notes: notes || '',
      },
    });

    return NextResponse.json({ success: true, reminder }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await prisma.appointmentReminder.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: 'Reminder deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 });
  }
}
