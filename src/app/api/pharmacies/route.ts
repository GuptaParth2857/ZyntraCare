import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDistanceKm } from '@/utils/distance';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';

  try {
    const where: any = {};
    if (city) where.city = { contains: city };

    const dbPharmacies = await prisma.pharmacy.findMany({ where });

    if (dbPharmacies.length === 0) {
      return NextResponse.json({ pharmacies: [], total: 0, source: 'database' });
    }

    let formatted = dbPharmacies.map(p => ({
      id: p.id,
      name: p.name,
      address: p.address,
      city: p.city,
      phone: p.phone,
      location: { lat: p.lat, lng: p.lng },
      distance: p.lat && p.lng ? getDistanceKm(lat, lng, p.lat, p.lng) : 999,
      open24x7: p.open24Hours,
      rating: p.rating,
      deliveryAvailable: p.deliveryAvailable,
      isOnline: p.isOnline,
    })).sort((a, b) => a.distance - b.distance);

    if (search) {
      formatted = formatted.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    return NextResponse.json({
      pharmacies: formatted,
      total: formatted.length,
      source: 'database',
    });
  } catch (error) {
    console.error('Pharmacy API error:', error);
    return NextResponse.json({ pharmacies: [], total: 0, source: 'error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pharmacy = await prisma.pharmacy.create({ data: body });
    return NextResponse.json({ pharmacy, source: 'database' }, { status: 201 });
  } catch (error) {
    console.error('Pharmacy POST error:', error);
    return NextResponse.json({ error: 'Failed to create pharmacy' }, { status: 500 });
  }
}
