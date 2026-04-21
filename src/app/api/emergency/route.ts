import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const userId = searchParams.get('userId');
  const hospitalId = searchParams.get('hospitalId');
  
  try {
    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (hospitalId) where.hospitalId = hospitalId;
    
    const alerts = await prisma.emergencyAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Emergency alerts error:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, location, latitude, longitude, alertType, description } = body;
    
    if (!userId || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const alert = await prisma.emergencyAlert.create({
      data: {
        userId,
        location,
        latitude,
        longitude,
        alertType: alertType || 'MEDICAL',
        description,
        status: 'TRIGGERED',
      },
    });
    
    return NextResponse.json({ alert });
  } catch (error) {
    console.error('Create emergency alert error:', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { alertId, status, responders, ambulanceId, hospitalId } = body;
    
    if (!alertId) {
      return NextResponse.json({ error: 'Missing alertId' }, { status: 400 });
    }
    
    const alert = await prisma.emergencyAlert.update({
      where: { id: alertId },
      data: {
        status,
        responders,
        ambulanceId,
        hospitalId,
      },
    });
    
    return NextResponse.json({ alert });
  } catch (error) {
    console.error('Update emergency alert error:', error);
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}