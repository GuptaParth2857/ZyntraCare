import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { authRateLimit } from '@/lib/rate-limit';

const EMERGENCY_NUMBERS = [
  { type: 'ambulance', number: '102', name: 'National Ambulance', state: 'All India', available: true },
  { type: 'ambulance', number: '108', name: 'Emergency Ambulance', state: 'All India', available: true },
  { type: 'police', number: '100', name: 'Police Emergency', state: 'All India', available: true },
  { type: 'fire', number: '101', name: 'Fire Brigade', state: 'All India', available: true },
  { type: 'disaster', number: '112', name: 'National Emergency', state: 'All India', available: true },
  { type: 'medical', number: '104', name: 'Medical Helpline', state: 'Delhi', available: true },
  { type: 'medical', number: '104', name: 'Medical Helpline', state: 'Maharashtra', available: true },
  { type: 'medical', number: '104', name: 'Medical Helpline', state: 'Karnataka', available: true },
  { type: 'medical', number: '104', name: 'Medical Helpline', state: 'Haryana', available: true },
  { type: 'medical', number: '102', name: 'Health Helpline', state: 'West Bengal', available: true },
  { type: 'child', number: '1098', name: 'Child Helpline', state: 'All India', available: true },
  { type: 'medical', number: '1800-180-1111', name: 'National Health', state: 'All India', available: true },
];

export async function GET(req: NextRequest) {
  const rateLimitCheck = authRateLimit(req, 30, 60000);
  if (rateLimitCheck) return rateLimitCheck;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const city = searchParams.get('city');

  try {
    const where: Record<string, unknown> = {};
    if (type) where.alertType = type;
    if (status) where.status = status;

    const [alerts, emergencyHospitals, ambulanceServices, allHospitals] = await Promise.all([
      prisma.emergencyAlert.findMany({ where, orderBy: { createdAt: 'desc' } }),
      prisma.hospital.findMany({
        where: { emergency: true },
        select: { name: true, phone: true, city: true, lat: true, lng: true },
      }),
      prisma.ambulance.findMany({
        select: { driverName: true, vehicleNumber: true, phone: true, type: true, isAvailable: true },
      }),
      prisma.hospital.findMany({ select: { id: true, name: true } }),
    ]);

    const hospitalMap = new Map(allHospitals.map(h => [h.id, h.name]));

    let filteredAlerts = alerts;
    if (city) {
      filteredAlerts = alerts.filter(a =>
        a.location?.toLowerCase().includes(city.toLowerCase())
      );
    }

    const formattedAlerts = filteredAlerts.map(a => ({
      id: a.id,
      type: a.alertType,
      status: a.status,
      hospital: a.hospitalId ? hospitalMap.get(a.hospitalId) || null : null,
      description: a.description,
      createdAt: a.createdAt,
      location: a.latitude != null && a.longitude != null
        ? { lat: a.latitude, lng: a.longitude }
        : null,
    }));

    const formattedAmbulances = ambulanceServices.map(a => ({
      name: a.driverName || `Ambulance ${a.vehicleNumber}`,
      phone: a.phone,
      type: a.type,
      isAvailable: a.isAvailable,
    }));

    return NextResponse.json({
      alerts: formattedAlerts,
      emergencyNumbers: EMERGENCY_NUMBERS,
      emergencyHospitals,
      ambulanceServices: formattedAmbulances,
      total: filteredAlerts.length,
    });
  } catch (error) {
    console.error('Emergency API error:', error);
    return NextResponse.json({ error: 'Failed to fetch emergency data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const rateLimitCheck = authRateLimit(req, 10, 60000);
  if (rateLimitCheck) return rateLimitCheck;

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: false });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const alert = await prisma.emergencyAlert.create({
      data: {
        userId: token.sub!,
        location: body.location || '',
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        alertType: body.alertType || body.type || 'MEDICAL',
        description: body.description || '',
        status: 'TRIGGERED',
        responders: body.responders || null,
        ambulanceId: body.ambulanceId || null,
        hospitalId: body.hospitalId || null,
      },
    });

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error('Failed to create alert:', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}
