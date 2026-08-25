import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDistanceKm } from '@/utils/distance';

export async function POST(req: Request) {
  try {
    const { lat, lng, specialty } = await req.json();

    const hospitals = await prisma.hospital.findMany({
      where: specialty ? { specialties: { contains: specialty } } : {},
    });

    if (hospitals.length === 0) {
      return NextResponse.json([]);
    }

    const scored = hospitals
      .filter(h => h.lat && h.lng)
      .map(h => {
        const beds = JSON.parse(h.beds || '{}');
        const distance = getDistanceKm(lat || 28.6139, lng || 77.2090, h.lat!, h.lng!);
        const totalBeds = beds.total || 100;
        const availableBeds = beds.available || 0;
        const bedScore = totalBeds > 0 ? availableBeds / totalBeds : 0;
        const emergencyScore = h.emergency ? 1 : 0;
        const score = (1 / (distance + 1)) * 0.5 + bedScore * 0.3 + emergencyScore * 0.2;
        return {
          id: h.id,
          name: h.name,
          address: h.address,
          city: h.city,
          state: h.state,
          phone: h.phone,
          rating: h.rating,
          distance: Math.round(distance * 10) / 10,
          emergency: h.emergency,
          beds: beds,
          location: { lat: h.lat, lng: h.lng },
          score,
        };
      });

    scored.sort((a, b) => b.score - a.score);
    return NextResponse.json(scored.slice(0, 5));
  } catch (error) {
    console.error('Recommend API error:', error);
    return NextResponse.json([]);
  }
}
