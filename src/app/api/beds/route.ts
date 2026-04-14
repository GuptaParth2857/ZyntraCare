import { NextRequest, NextResponse } from 'next/server';

function getTimeBasedOccupancy(total: number): { occupied: number; available: number } {
  const hour = new Date().getHours();
  let baseOccupancy = Math.floor(total * 0.6);
  
  if (hour >= 8 && hour <= 12) baseOccupancy += Math.floor(Math.random() * 15);
  else if (hour >= 18 && hour <= 22) baseOccupancy += Math.floor(Math.random() * 20);
  else baseOccupancy += Math.floor(Math.random() * 10);
  
  baseOccupancy = Math.max(Math.floor(total * 0.3), Math.min(Math.floor(total * 0.95), baseOccupancy));
  return { occupied: baseOccupancy, available: total - baseOccupancy };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state');
  const city = searchParams.get('city');
  
  try {
    // Fetch real hospitals from OSM API
    const hospitalsRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/hospitals/nearby?lat=28.6139&lng=77.2090&radius=100000`,
      { next: { revalidate: 60 } }
    );
    
    let hospitalsData = [];
    if (hospitalsRes.ok) {
      const data = await hospitalsRes.json();
      hospitalsData = data.hospitals || [];
    }
    
    // Generate dynamic bed data for each hospital
    const bedStatus = hospitalsData.map((h: any) => {
      const totalBeds = h.beds?.total || Math.floor(Math.random() * 200) + 50;
      const totalICU = h.beds?.icu || Math.floor(totalBeds * 0.1);
      
      const bedOccupancy = getTimeBasedOccupancy(totalBeds);
      const icuOccupancy = getTimeBasedOccupancy(totalICU);
      
      return {
        id: h.id,
        name: h.name,
        address: h.address,
        city: h.city,
        state: h.state,
        phone: h.phone,
        emergency: h.emergency,
        rating: h.rating,
        location: h.location,
        beds: {
          total: totalBeds,
          occupied: bedOccupancy.occupied,
          available: bedOccupancy.available,
          occupancyPercent: Math.round((bedOccupancy.occupied / totalBeds) * 100),
          icu: {
            total: totalICU,
            occupied: icuOccupancy.occupied,
            available: icuOccupancy.available,
            occupancyPercent: Math.round((icuOccupancy.occupied / totalICU) * 100)
          }
        },
        lastUpdated: new Date().toISOString()
      };
    });
    
    // Filter if state/city provided
    let filtered = bedStatus;
    if (state) {
      filtered = filtered.filter((h: any) => h.state?.toLowerCase().includes(state.toLowerCase()));
    }
    if (city) {
      filtered = filtered.filter((h: any) => h.city?.toLowerCase().includes(city.toLowerCase()));
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalHospitals: filtered.length,
      summary: {
        totalBeds: filtered.reduce((a: number, h: any) => a + h.beds.total, 0),
        availableBeds: filtered.reduce((a: number, h: any) => a + h.beds.available, 0),
        totalICU: filtered.reduce((a: number, h: any) => a + h.beds.icu.total, 0),
        availableICU: filtered.reduce((a: number, h: any) => a + h.beds.icu.available, 0)
      },
      hospitals: filtered
    });
  } catch (error) {
    console.error('Beds API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch hospital data',
      hospitals: []
    }, { status: 500 });
  }
}