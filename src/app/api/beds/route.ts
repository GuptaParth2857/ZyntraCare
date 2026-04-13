import { NextResponse } from 'next/server';
import { hospitals } from '@/data/mockData';

function getTimeBasedOccupancy(base: number, total: number): { occupied: number; available: number } {
  const hour = new Date().getHours();
  let occupancy = base;
  
  if (hour >= 8 && hour <= 12) occupancy += Math.floor(Math.random() * 15);
  else if (hour >= 18 && hour <= 22) occupancy += Math.floor(Math.random() * 20);
  else occupancy += Math.floor(Math.random() * 10);
  
  occupancy = Math.max(Math.floor(total * 0.3), Math.min(Math.floor(total * 0.95), occupancy));
  return { occupied: occupancy, available: total - occupancy };
}

export async function GET() {
  const bedStatus = hospitals.map(h => {
    const bedOccupancy = getTimeBasedOccupancy(h.beds.occupied, h.beds.total);
    const icuOccupancy = getTimeBasedOccupancy(h.beds.icuOccupied || h.beds.icu - h.beds.icuAvailable, h.beds.icu);
    
    return {
      id: h.id,
      name: h.name,
      address: h.address,
      city: h.city,
      state: h.state,
      phone: h.phone,
      emergency: h.emergency,
      rating: h.rating,
      beds: {
        total: h.beds.total,
        occupied: bedOccupancy.occupied,
        available: bedOccupancy.available,
        occupancyPercent: Math.round((bedOccupancy.occupied / h.beds.total) * 100),
        icu: {
          total: h.beds.icu,
          occupied: icuOccupancy.occupied,
          available: icuOccupancy.available,
          occupancyPercent: Math.round((icuOccupancy.occupied / h.beds.icu) * 100)
        }
      },
      lastUpdated: new Date().toISOString()
    };
  });
  
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    totalHospitals: bedStatus.length,
    summary: {
      totalBeds: bedStatus.reduce((a, h) => a + h.beds.total, 0),
      availableBeds: bedStatus.reduce((a, h) => a + h.beds.available, 0),
      totalICU: bedStatus.reduce((a, h) => a + h.beds.icu.total, 0),
      availableICU: bedStatus.reduce((a, h) => a + h.beds.icu.available, 0)
    },
    hospitals: bedStatus
  });
}
