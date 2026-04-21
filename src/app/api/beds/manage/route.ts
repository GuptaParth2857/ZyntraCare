import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hospitalId = searchParams.get('hospitalId');
  const status = searchParams.get('status');
  
  try {
    const where: any = {};
    if (hospitalId) where.hospitalId = hospitalId;
    if (status) where.status = status;
    
    const beds = await prisma.hospitalBed.findMany({
      where,
      include: { hospital: true },
      orderBy: { bedNumber: 'asc' },
    });
    
    return NextResponse.json({ beds });
  } catch (error) {
    console.error('Bed management error:', error);
    return NextResponse.json({ error: 'Failed to fetch beds' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hospitalId, floor, ward, bedNumber, bedType, price, amenities } = body;
    
    if (!hospitalId || !bedNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const bed = await prisma.hospitalBed.create({
      data: {
        hospitalId,
        floor,
        ward,
        bedNumber,
        bedType: bedType || 'GENERAL',
        price: price || 500,
        amenities: JSON.stringify(amenities || []),
        status: 'AVAILABLE',
      },
    });
    
    return NextResponse.json({ bed });
  } catch (error) {
    console.error('Create bed error:', error);
    return NextResponse.json({ error: 'Failed to create bed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { bedId, status, occupiedBy, bedType, price } = body;
    
    if (!bedId) {
      return NextResponse.json({ error: 'Missing bedId' }, { status: 400 });
    }
    
    const bed = await prisma.hospitalBed.update({
      where: { id: bedId },
      data: {
        status,
        occupiedBy,
        bedType,
        price,
      },
    });
    
    return NextResponse.json({ bed });
  } catch (error) {
    console.error('Update bed error:', error);
    return NextResponse.json({ error: 'Failed to update bed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bedId = searchParams.get('bedId');
  
  if (!bedId) {
    return NextResponse.json({ error: 'Missing bedId' }, { status: 400 });
  }
  
  try {
    await prisma.hospitalBed.delete({ where: { id: bedId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete bed error:', error);
    return NextResponse.json({ error: 'Failed to delete bed' }, { status: 500 });
  }
}