import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDistanceKm } from '@/utils/distance';

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
      where.city = { contains: city };
    }
    
    if (specialty) {
      where.specialties = { contains: specialty };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { specialties: { contains: search } },
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
      } catch { beds = { total: 0, available: 0, icu: 0, icuAvailable: 0 }; }

      let specs: string[] = [];
      try {
        specs = typeof h.specialties === 'string' ? JSON.parse(h.specialties) : [];
      } catch { specs = []; }

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
        distance: getDistanceKm(lat, lng, h.location.lat, h.location.lng),
      })).sort((a: any, b: any) => a.distance - b.distance);
    }

    let cities: string[] = [];
    try {
      const cityResults = await prisma.hospital.findMany({
        select: { city: true },
        distinct: ['city'],
      });
      cities = cityResults.map(c => c.city).sort();
    } catch {
      console.error('Failed to fetch cities');
      cities = [];
    }

    return NextResponse.json({
      hospitals: formatted,
      total,
      page,
      pages: Math.ceil(total / limit),
      cities,
    });
  } catch (error) {
    console.error('Hospitals API error:', error);
    return NextResponse.json({ hospitals: [], total: 0, page: 1, pages: 0, cities: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hospital = await prisma.hospital.create({
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode || '',
        phone: body.phone,
        email: body.email || '',
        website: body.website || '',
        specialties: JSON.stringify(body.specialties || []),
        beds: JSON.stringify(body.beds || { total: 0, available: 0, icu: 0, icuAvailable: 0 }),
        emergency: body.emergency || false,
        lat: body.lat || 0,
        lng: body.lng || 0,
        doctors: body.doctors || 0,
        workingHours: body.workingHours || '24/7',
      },
    });
    return NextResponse.json({ success: true, hospital }, { status: 201 });
  } catch (error) {
    console.error('Hospital POST error:', error);
    return NextResponse.json({ error: 'Failed to register hospital' }, { status: 500 });
  }
}
