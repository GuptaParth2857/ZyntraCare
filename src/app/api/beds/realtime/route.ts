// Real-time bed status API - Hospital updates their bed availability
import { NextRequest, NextResponse } from 'next/server';

const MOCK_BED_DATA: Record<string, {
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  totalICU: number;
  availableICU: number;
  occupiedICU: number;
}> = {};

function calculateOccupancy(total: number, available: number): number {
  if (total === 0) return 0;
  return Math.round(((total - available) / total) * 100);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hospitalId = searchParams.get('hospitalId');
  const all = searchParams.get('all') === 'true';

  if (all) {
    return NextResponse.json({
      success: true,
      data: Object.entries(MOCK_BED_DATA).map(([id, data]) => ({
        hospitalId: id,
        ...data,
        occupancyPercent: calculateOccupancy(data.totalBeds, data.availableBeds),
        icuOccupancy: calculateOccupancy(data.totalICU, data.availableICU),
        lastUpdated: new Date().toISOString()
      })),
      timestamp: new Date().toISOString()
    });
  }

  if (!hospitalId) {
    return NextResponse.json({ success: false, error: 'hospitalId required' }, { status: 400 });
  }

  const data = MOCK_BED_DATA[hospitalId];
  if (!data) {
    return NextResponse.json({
      success: true,
      data: {
        hospitalId,
        totalBeds: Math.floor(Math.random() * 100) + 20,
        availableBeds: Math.floor(Math.random() * 30) + 5,
        occupiedBeds: 0,
        totalICU: Math.floor(Math.random() * 20) + 5,
        availableICU: Math.floor(Math.random() * 5) + 1,
        occupiedICU: 0,
        lastUpdated: new Date().toISOString()
      }
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      ...data,
      occupancyPercent: calculateOccupancy(data.totalBeds, data.availableBeds),
      icuOccupancy: calculateOccupancy(data.totalICU, data.availableICU),
      lastUpdated: new Date().toISOString()
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hospitalId, hospitalName, totalBeds, availableBeds, totalICU, availableICU, updateSource, adminKey } = body;

    if (!hospitalId || !hospitalName) {
      return NextResponse.json({ success: false, error: 'hospitalId and hospitalName required' }, { status: 400 });
    }

    if (adminKey && adminKey !== process.env.HOSPITAL_ADMIN_KEY) {
      return NextResponse.json({ success: false, error: 'Invalid admin key' }, { status: 403 });
    }

    const occupiedBeds = (totalBeds || 0) - (availableBeds || 0);
    const occupiedICU = (totalICU || 0) - (availableICU || 0);

    MOCK_BED_DATA[hospitalId] = {
      totalBeds: totalBeds || 0,
      availableBeds: availableBeds || 0,
      occupiedBeds: Math.max(0, occupiedBeds),
      totalICU: totalICU || 0,
      availableICU: availableICU || 0,
      occupiedICU: Math.max(0, occupiedICU)
    };

    return NextResponse.json({
      success: true,
      message: 'Bed status updated',
      data: {
        hospitalId,
        hospitalName,
        totalBeds: MOCK_BED_DATA[hospitalId].totalBeds,
        availableBeds: MOCK_BED_DATA[hospitalId].availableBeds,
        occupiedBeds: MOCK_BED_DATA[hospitalId].occupiedBeds,
        occupancyPercent: calculateOccupancy(MOCK_BED_DATA[hospitalId].totalBeds, MOCK_BED_DATA[hospitalId].availableBeds),
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Bed update error:', error);
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}