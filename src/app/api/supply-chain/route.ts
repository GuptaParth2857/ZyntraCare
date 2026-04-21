import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get('batchId');
  const hospitalId = searchParams.get('hospitalId');
  const status = searchParams.get('status');
  
  try {
    const where: any = {};
    if (batchId) where.batchId = batchId;
    if (hospitalId) where.hospitalId = hospitalId;
    if (status) where.supplyStatus = status;
    
    const supplies = await prisma.medicineSupply.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    return NextResponse.json({ supplies });
  } catch (error) {
    console.error('Supply chain error:', error);
    return NextResponse.json({ error: 'Failed to fetch supplies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { batchId, medicine, manufacturer, distributor, hospitalId, quantity, manufacturingDate, expiryDate, currentLocation, blockchainHash } = body;
    
    if (!batchId || !medicine || !manufacturer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const supply = await prisma.medicineSupply.create({
      data: {
        batchId,
        medicine,
        manufacturer,
        distributor: distributor || '',
        hospitalId,
        quantity: quantity || 0,
        manufacturingDate: new Date(manufacturingDate),
        expiryDate: new Date(expiryDate),
        currentLocation,
        supplyStatus: 'MANUFACTURED',
        blockchainHash,
      },
    });
    
    return NextResponse.json({ supply });
  } catch (error) {
    console.error('Create supply error:', error);
    return NextResponse.json({ error: 'Failed to create supply' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { supplyId, supplyStatus, currentLocation, hospitalId, quantity } = body;
    
    if (!supplyId) {
      return NextResponse.json({ error: 'Missing supplyId' }, { status: 400 });
    }
    
    const supply = await prisma.medicineSupply.update({
      where: { id: supplyId },
      data: {
        supplyStatus,
        currentLocation,
        hospitalId,
        quantity,
      },
    });
    
    return NextResponse.json({ supply });
  } catch (error) {
    console.error('Update supply error:', error);
    return NextResponse.json({ error: 'Failed to update supply' }, { status: 500 });
  }
}