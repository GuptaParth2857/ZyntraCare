import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function calculateOccupancy(total: number, available: number): number {
  if (total === 0) return 0;
  return Math.round(((total - available) / total) * 100);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hospitalId = searchParams.get('hospitalId');
  const all = searchParams.get('all') === 'true';

  try {
    if (all) {
      const beds = await prisma.realTimeBed.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 50,
      });

      return NextResponse.json({
        success: true,
        data: beds.map(b => ({
          hospitalId: b.hospitalId,
          hospitalName: b.hospitalName,
          totalBeds: b.totalBeds,
          availableBeds: b.availableBeds,
          occupiedBeds: b.occupiedBeds,
          totalICU: b.totalICU,
          availableICU: b.availableICU,
          occupiedICU: b.occupiedICU,
          occupancyPercent: calculateOccupancy(b.totalBeds, b.availableBeds),
          icuOccupancy: b.icuOccupancy,
          lastUpdated: b.updatedAt.toISOString(),
        })),
        timestamp: new Date().toISOString(),
      });
    }

    if (!hospitalId) {
      const hospital = await prisma.hospital.findFirst();
      if (!hospital) {
        return NextResponse.json({ success: false, error: 'No hospitals found' }, { status: 404 });
      }
      
      let beds = await prisma.realTimeBed.findFirst({ where: { hospitalId: hospital.id } });
      
      if (!beds) {
        let parsedBeds = { total: 100, available: 30, icu: 10, icuAvailable: 3 };
        try { parsedBeds = JSON.parse(hospital.beds); } catch {}
        
        beds = await prisma.realTimeBed.create({
          data: {
            hospitalId: hospital.id,
            hospitalName: hospital.name,
            totalBeds: parsedBeds.total,
            availableBeds: parsedBeds.available,
            occupiedBeds: parsedBeds.total - parsedBeds.available,
            totalICU: parsedBeds.icu,
            availableICU: parsedBeds.icuAvailable,
            occupiedICU: parsedBeds.icu - parsedBeds.icuAvailable,
            icuOccupancy: Math.round(((parsedBeds.icu - parsedBeds.icuAvailable) / parsedBeds.icu) * 100) || 0,
            generalOccupancy: Math.round(((parsedBeds.total - parsedBeds.available) / parsedBeds.total) * 100) || 0,
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          hospitalId: beds.hospitalId,
          hospitalName: beds.hospitalName,
          totalBeds: beds.totalBeds,
          availableBeds: beds.availableBeds,
          occupiedBeds: beds.occupiedBeds,
          totalICU: beds.totalICU,
          availableICU: beds.availableICU,
          occupiedICU: beds.occupiedICU,
          occupancyPercent: calculateOccupancy(beds.totalBeds, beds.availableBeds),
          icuOccupancy: beds.icuOccupancy,
          lastUpdated: beds.updatedAt.toISOString(),
        },
      });
    }

    const existing = await prisma.realTimeBed.findFirst({ where: { hospitalId } });
    
    if (existing) {
      return NextResponse.json({
        success: true,
        data: {
          hospitalId: existing.hospitalId,
          hospitalName: existing.hospitalName,
          totalBeds: existing.totalBeds,
          availableBeds: existing.availableBeds,
          occupiedBeds: existing.occupiedBeds,
          totalICU: existing.totalICU,
          availableICU: existing.availableICU,
          occupiedICU: existing.occupiedICU,
          occupancyPercent: calculateOccupancy(existing.totalBeds, existing.availableBeds),
          icuOccupancy: existing.icuOccupancy,
          lastUpdated: existing.updatedAt.toISOString(),
        },
      });
    }

    const hospital = await prisma.hospital.findFirst({ where: { id: hospitalId } });
    if (!hospital) {
      return NextResponse.json({ success: false, error: 'Hospital not found' }, { status: 404 });
    }

    let parsedBeds = { total: 100, available: 30, icu: 10, icuAvailable: 3 };
    try { parsedBeds = JSON.parse(hospital.beds); } catch {}

    return NextResponse.json({
      success: true,
      data: {
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        totalBeds: parsedBeds.total,
        availableBeds: parsedBeds.available,
        occupiedBeds: parsedBeds.total - parsedBeds.available,
        totalICU: parsedBeds.icu,
        availableICU: parsedBeds.icuAvailable,
        occupiedICU: parsedBeds.icu - parsedBeds.icuAvailable,
        occupancyPercent: Math.round(((parsedBeds.total - parsedBeds.available) / parsedBeds.total) * 100),
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Bed API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bed data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hospitalId, hospitalName, totalBeds, availableBeds, totalICU, availableICU, updateSource } = body;

    if (!hospitalId) {
      return NextResponse.json({ success: false, error: 'hospitalId required' }, { status: 400 });
    }

    const occupiedBeds = (totalBeds || 0) - (availableBeds || 0);
    const occupiedICU = (totalICU || 0) - (availableICU || 0);
    const occupancyPercent = calculateOccupancy(totalBeds || 0, availableBeds || 0);
    const icuOccupancy = totalICU ? Math.round(((totalICU - (availableICU || 0)) / totalICU) * 100) : 0;

    const data = await prisma.realTimeBed.upsert({
      where: { hospitalId },
      create: {
        hospitalId,
        hospitalName: hospitalName || 'Hospital',
        totalBeds: totalBeds || 0,
        availableBeds: availableBeds || 0,
        occupiedBeds: Math.max(0, occupiedBeds),
        totalICU: totalICU || 0,
        availableICU: availableICU || 0,
        occupiedICU: Math.max(0, occupiedICU),
        icuOccupancy,
        generalOccupancy: occupancyPercent,
        updateSource: updateSource || 'api',
      },
      update: {
        hospitalName: hospitalName || 'Hospital',
        totalBeds: totalBeds || 0,
        availableBeds: availableBeds || 0,
        occupiedBeds: Math.max(0, occupiedBeds),
        totalICU: totalICU || 0,
        availableICU: availableICU || 0,
        occupiedICU: Math.max(0, occupiedICU),
        icuOccupancy,
        generalOccupancy: occupancyPercent,
        updateSource: updateSource || 'api',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Bed status updated',
      data: {
        hospitalId: data.hospitalId,
        hospitalName: data.hospitalName,
        totalBeds: data.totalBeds,
        availableBeds: data.availableBeds,
        occupiedBeds: data.occupiedBeds,
        occupancyPercent: calculateOccupancy(data.totalBeds, data.availableBeds),
        lastUpdated: data.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Bed update error:', error);
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}