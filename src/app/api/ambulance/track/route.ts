import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ambulanceId = searchParams.get('ambulanceId');
  const isAvailable = searchParams.get('isAvailable');
  
  try {
    const where: any = {};
    if (ambulanceId) where.id = ambulanceId;
    if (isAvailable) where.isAvailable = isAvailable === 'true';
    
    const ambulances = await prisma.ambulance.findMany({
      where,
      include: {
        bookings: {
          where: { status: { in: ['assigned', 'en_route'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        locationUpdates: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });
    
    return NextResponse.json({ ambulances });
  } catch (error) {
    console.error('Ambulance tracking error:', error);
    return NextResponse.json({ error: 'Failed to fetch ambulances' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vehicleNumber, phone, driverName, type, hospitalId, email } = body;
    
    if (!vehicleNumber || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const ambulance = await prisma.ambulance.create({
      data: {
        vehicleNumber,
        phone,
        driverName,
        type: type || 'basic',
        hospitalId,
        email,
        isAvailable: true,
      },
    });
    
    return NextResponse.json({ ambulance });
  } catch (error) {
    console.error('Create ambulance error:', error);
    return NextResponse.json({ error: 'Failed to create ambulance' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ambulanceId, isAvailable, lat, lng, driverName, phone } = body;
    
    if (!ambulanceId) {
      return NextResponse.json({ error: 'Missing ambulanceId' }, { status: 400 });
    }
    
    let ambulance;
    if (lat !== undefined && lng !== undefined) {
      await prisma.ambulanceLocationUpdate.create({
        data: { ambulanceId, lat, lng },
      });
      
      ambulance = await prisma.ambulance.update({
        where: { id: ambulanceId },
        data: { lat, lng, isAvailable },
      });
    } else {
      ambulance = await prisma.ambulance.update({
        where: { id: ambulanceId },
        data: { isAvailable, driverName, phone },
      });
    }
    
    return NextResponse.json({ ambulance });
  } catch (error) {
    console.error('Update ambulance error:', error);
    return NextResponse.json({ error: 'Failed to update ambulance' }, { status: 500 });
  }
}