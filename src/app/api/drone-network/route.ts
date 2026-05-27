import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const drones = await prisma.drone.findMany({ orderBy: { createdAt: 'desc' } });
    const missions = await prisma.droneMission.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
    return NextResponse.json({ success: true, drones, missions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drone data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...data } = body;
    
    if (action === 'register-drone') {
      const drone = await prisma.drone.create({ data: { droneId: data.droneId, name: data.name, model: data.model, hospitalId: data.hospitalId } });
      return NextResponse.json({ success: true, drone });
    }
    
    if (action === 'create-mission') {
      const mission = await prisma.droneMission.create({ data: { droneId: data.droneId, type: data.type, originLat: data.originLat, originLng: data.originLng, destLat: data.destLat, destLng: data.destLng, packageDesc: data.packageDesc, recipientName: data.recipientName, recipientPhone: data.recipientPhone } });
      return NextResponse.json({ success: true, mission });
    }
    
    if (action === 'update-status') {
      const drone = await prisma.drone.update({ where: { id: data.id }, data: { status: data.status, batteryLevel: data.batteryLevel, lat: data.lat, lng: data.lng } });
      return NextResponse.json({ success: true, drone });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
