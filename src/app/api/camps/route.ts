import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const state = searchParams.get('state');

  try {
    const where: Record<string, unknown> = {};
    if (city) where.city = { contains: city };
    if (state) where.state = { contains: state };

    const [camps, citiesResult, statesResult] = await Promise.all([
      prisma.healthCamp.findMany({ where, orderBy: { date: 'asc' } }),
      prisma.healthCamp.findMany({
        select: { city: true },
        distinct: ['city'],
      }),
      prisma.healthCamp.findMany({
        select: { state: true },
        distinct: ['state'],
      }),
    ]);

    const formattedCamps = camps.map(c => ({
      ...c,
      services: typeof c.services === 'string' ? JSON.parse(c.services) : c.services,
      locationCoords: c.lat != null && c.lng != null
        ? { lat: c.lat, lng: c.lng }
        : null,
    }));

    return NextResponse.json({
      camps: formattedCamps,
      total: camps.length,
      cities: citiesResult.map(c => c.city).filter(Boolean),
      states: statesResult.map(s => s.state).filter(Boolean),
    });
  } catch (error) {
    console.error('Camps API error:', error);
    return NextResponse.json({ error: 'Failed to fetch camps' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: false });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const camp = await prisma.healthCamp.create({
      data: {
        name: body.name,
        campType: body.campType || body.type,
        date: body.date,
        time: body.time,
        location: body.location,
        city: body.city,
        state: body.state,
        lat: body.lat ?? body.locationCoords?.lat ?? null,
        lng: body.lng ?? body.locationCoords?.lng ?? null,
        services: JSON.stringify(body.services || []),
        hospital: body.hospital,
        hospitalId: body.hospitalId || null,
        registration: body.registration || 'Free',
        spotsAvailable: body.spotsAvailable ?? 50,
        organizedBy: body.organizedBy || body.hospital,
      },
    });

    return NextResponse.json({ success: true, camp });
  } catch (error) {
    console.error('Failed to create camp:', error);
    return NextResponse.json({ error: 'Failed to create camp' }, { status: 500 });
  }
}
