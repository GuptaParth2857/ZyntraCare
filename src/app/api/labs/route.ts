import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDistanceKm } from '@/utils/distance';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const test = searchParams.get('test') || '';
  const city = searchParams.get('city') || '';

  try {
    const where: any = {};
    if (city) where.city = { contains: city };
    if (test) where.tests = { contains: test };

    const dbLabs = await prisma.lab.findMany({ where });

    if (dbLabs.length === 0) {
      return NextResponse.json({ labs: [], total: 0, availableTests: [], source: 'database' });
    }

    const formatted = dbLabs.map(p => {
      const tests = JSON.parse(p.tests || '[]') as string[];
      return {
        id: p.id,
        name: p.name,
        address: p.address,
        city: p.city,
        phone: p.phone,
        location: { lat: p.lat, lng: p.lng },
        distance: p.lat && p.lng ? getDistanceKm(lat, lng, p.lat, p.lng) : 999,
        tests,
        homeCollection: p.homeCollection,
        reportsIn: '24 hours',
        rating: p.rating,
      };
    }).sort((a, b) => a.distance - b.distance);

    const allTests = [...new Set(formatted.flatMap(l => l.tests))];

    const filtered = test
      ? formatted.filter(l => l.tests.some(t => t.toLowerCase().includes(test.toLowerCase())))
      : formatted;

    return NextResponse.json({
      labs: filtered,
      total: filtered.length,
      availableTests: allTests,
      source: 'database',
    });
  } catch (error) {
    console.error('Labs API error:', error);
    return NextResponse.json({ labs: [], total: 0, availableTests: [], source: 'error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lab = await prisma.lab.create({ data: body });
    return NextResponse.json({ lab, source: 'database' }, { status: 201 });
  } catch (error) {
    console.error('Labs POST error:', error);
    return NextResponse.json({ error: 'Failed to create lab' }, { status: 500 });
  }
}
