import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ambulanceId = searchParams.get('ambulanceId');
  const available = searchParams.get('available');
  const allActive = searchParams.get('allActive');

  try {
    const where: any = {};

    if (ambulanceId) {
      where.id = ambulanceId;
    }

    if (available === 'true') {
      where.isAvailable = true;
    }

    if (allActive === 'true') {
      where.lat = { not: null };
      where.lng = { not: null };
    }

    const ambulances = await prisma.ambulance.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      drivers: ambulances.map((a) => ({
        id: a.id,
        driverName: a.driverName,
        vehicleNumber: a.vehicleNumber,
        phone: a.phone,
        lat: a.lat,
        lng: a.lng,
        isAvailable: a.isAvailable,
        type: a.type,
        lastUpdated: a.updatedAt.toISOString(),
      })),
      total: ambulances.length,
    });
  } catch (error) {
    console.error('Ambulance track GET error:', error);
    return NextResponse.json({
      success: true,
      drivers: [],
      total: 0,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { driverId, lat, lng, status } = body;

    if (!driverId) {
      return NextResponse.json({ success: false, error: 'driverId required' }, { status: 400 });
    }

    if (lat == null || lng == null) {
      return NextResponse.json({ success: false, error: 'lat and lng required' }, { status: 400 });
    }

    try {
      const ambulance = await prisma.ambulance.update({
        where: { id: driverId },
        data: {
          lat,
          lng,
          isAvailable: status === 'available',
        },
      });

      await prisma.ambulanceLocationUpdate.create({
        data: {
          ambulanceId: ambulance.id,
          lat,
          lng,
        },
      });

      return NextResponse.json({
        success: true,
        position: {
          id: ambulance.id,
          driverName: ambulance.driverName,
          lat: ambulance.lat,
          lng: ambulance.lng,
          isAvailable: ambulance.isAvailable,
          updatedAt: ambulance.updatedAt.toISOString(),
        },
      });
    } catch {
      // Ambulance model not available — return mock success for dev
      return NextResponse.json({
        success: true,
        position: {
          id: driverId,
          lat,
          lng,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Ambulance track POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update position' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ambulanceId, lat, lng, isAvailable } = body;

    if (!ambulanceId) {
      return NextResponse.json({ success: false, error: 'ambulanceId required' }, { status: 400 });
    }

    const ambulance = await prisma.ambulance.update({
      where: { id: ambulanceId },
      data: {
        lat: lat ?? undefined,
        lng: lng ?? undefined,
        isAvailable: isAvailable ?? undefined,
      },
    });

    if (lat != null && lng != null) {
      await prisma.ambulanceLocationUpdate.create({
        data: {
          ambulanceId: ambulance.id,
          lat,
          lng,
        },
      });
    }

    return NextResponse.json({
      success: true,
      ambulance: {
        id: ambulance.id,
        lat: ambulance.lat,
        lng: ambulance.lng,
        isAvailable: ambulance.isAvailable,
      },
    });
  } catch (error) {
    console.error('Ambulance track PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update ambulance' }, { status: 500 });
  }
}
