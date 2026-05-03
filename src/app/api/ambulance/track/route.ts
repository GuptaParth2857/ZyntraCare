import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ambulanceId = searchParams.get('ambulanceId');
  const available = searchParams.get('available');

  try {
    const where: any = {};
    
    if (ambulanceId) {
      where.id = ambulanceId;
    }
    
    if (available === 'true') {
      where.isAvailable = true;
    }

    const ambulances = await prisma.ambulance.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      ambulances: ambulances.map(a => ({
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
    console.error('Ambulance API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch ambulances' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { driverName, vehicleNumber, phone, lat, lng, type, hospitalId } = body;

    if (!vehicleNumber) {
      return NextResponse.json({ success: false, error: 'vehicleNumber required' }, { status: 400 });
    }

    const ambulance = await prisma.ambulance.upsert({
      where: { vehicleNumber },
      create: {
        driverName: driverName || 'Driver',
        vehicleNumber,
        phone: phone || '',
        lat: lat || 0,
        lng: lng || 0,
        type: type || 'basic',
        hospitalId,
        isAvailable: true,
      },
      update: {
        driverName: driverName || 'Driver',
        phone: phone || '',
        lat: lat || 0,
        lng: lng || 0,
        type: type || 'basic',
        hospitalId,
      },
    });

    return NextResponse.json({
      success: true,
      ambulance: {
        id: ambulance.id,
        driverName: ambulance.driverName,
        vehicleNumber: ambulance.vehicleNumber,
        phone: ambulance.phone,
        isAvailable: ambulance.isAvailable,
        type: ambulance.type,
      },
    });
  } catch (error) {
    console.error('Ambulance POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save ambulance' }, { status: 500 });
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

    await prisma.ambulanceLocationUpdate.create({
      data: {
        ambulanceId: ambulance.id,
        lat: lat || ambulance.lat || 0,
        lng: lng || ambulance.lng || 0,
      },
    });

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
    console.error('Ambulance PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update ambulance' }, { status: 500 });
  }
}