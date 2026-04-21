// Bed Availability Alerts API
import { NextRequest, NextResponse } from 'next/server';

interface BedAlert {
  id: string;
  userId: string;
  hospitalId: string;
  hospitalName: string;
  alertType: 'icu' | 'general' | 'any';
  targetAvailability: number;
  notified: boolean;
  createdAt: string;
}

const ALERTS: BedAlert[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (userId) {
    const userAlerts = ALERTS.filter(a => a.userId === userId && !a.notified);
    return NextResponse.json({ success: true, alerts: userAlerts });
  }

  return NextResponse.json({ success: true, alerts: ALERTS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, hospitalId, hospitalName, alertType, targetAvailability } = body;

    if (!userId || !hospitalId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const existingIndex = ALERTS.findIndex(
      a => a.userId === userId && a.hospitalId === hospitalId && a.alertType === alertType && !a.notified
    );

    const alert: BedAlert = {
      id: `alert_${Date.now()}`,
      userId,
      hospitalId,
      hospitalName: hospitalName || 'Hospital',
      alertType: alertType || 'any',
      targetAvailability: targetAvailability || 1,
      notified: false,
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      ALERTS[existingIndex] = alert;
    } else {
      ALERTS.push(alert);
    }

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const alertId = searchParams.get('alertId');
  const userId = searchParams.get('userId');

  if (alertId) {
    const index = ALERTS.findIndex(a => a.id === alertId);
    if (index >= 0) {
      ALERTS.splice(index, 1);
    }
  } else if (userId) {
    const userAlerts = ALERTS.filter(a => a.userId === userId);
    userAlerts.forEach(a => {
      const idx = ALERTS.findIndex(al => al.id === a.id);
      if (idx >= 0) ALERTS.splice(idx, 1);
    });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { hospitalId, alertType, available, icuAvailable } = body;

    const alertsToNotify = ALERTS.filter(
      a => a.hospitalId === hospitalId && 
      a.alertType === alertType && 
      !a.notified &&
      ((a.alertType === 'icu' && icuAvailable >= a.targetAvailability) ||
       (a.alertType !== 'icu' && available >= a.targetAvailability))
    );

    alertsToNotify.forEach(a => {
      const idx = ALERTS.findIndex(al => al.id === a.id);
      if (idx >= 0) {
        ALERTS[idx].notified = true;
      }
    });

    return NextResponse.json({ 
      success: true, 
      notified: alertsToNotify.map(a => a.id),
      count: alertsToNotify.length
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}