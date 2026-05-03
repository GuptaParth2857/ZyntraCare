import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const specialty = searchParams.get('specialty');
  const search = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const nearby = searchParams.get('nearby') === 'true';
  
  try {
    const where: any = {};
    
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { specialties: { contains: search, mode: 'insensitive' } },
      ];
    }

    const hospitals = await prisma.hospital.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { rating: 'desc' },
    });

    const total = await prisma.hospital.count({ where });

    let formatted = hospitals.map(h => {
      let beds = { total: 0, available: 0, icu: 0, icuAvailable: 0 };
      try {
        beds = typeof h.beds === 'string' ? JSON.parse(h.beds) : h.beds;
      } catch {}

      let specs: string[] = [];
      try {
        specs = typeof h.specialties === 'string' ? JSON.parse(h.specialties) : [];
      } catch {}

      return {
        id: h.id,
        name: h.name,
        city: h.city,
        state: h.state,
        address: h.address,
        phone: h.phone,
        location: { lat: h.lat, lng: h.lng },
        rating: h.rating,
        beds,
        specialties: specs,
        emergency: h.emergency,
        verified: h.verified,
        doctors: h.doctors,
      };
    });

    if (nearby && lat && lng) {
      formatted = formatted.map(h => ({
        ...h,
        distance: calculateHaversine(lat, lng, h.location.lat, h.location.lng),
      })).sort((a: any, b: any) => a.distance - b.distance);
    }

    const cities = await prisma.hospital.findMany({
      select: { city: true },
      distinct: ['city'],
    });

    return NextResponse.json({
      hospitals: formatted,
      total,
      page,
      pages: Math.ceil(total / limit),
      cities: cities.map(c => c.city).sort(),
    });
  } catch (error) {
    console.error('Hospitals API error:', error);
    return NextResponse.json({ error: 'Failed to fetch hospitals' }, { status: 500 });
  }
}