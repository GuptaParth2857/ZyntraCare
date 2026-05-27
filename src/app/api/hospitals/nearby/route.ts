import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDistanceKm } from '@/utils/distance';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const radius = parseInt(searchParams.get('radius') || '10000');

  try {
    const hospitals = await prisma.hospital.findMany({
      where: { verified: true },
      take: 50,
    });

    if (hospitals.length > 0) {
      const withDistance = hospitals
        .filter(h => h.lat && h.lng)
        .map(h => {
          const distance = getDistanceKm(lat, lng, h.lat!, h.lng!);
          let beds = { total: 0, occupied: 0, available: 0, icu: 0, icuAvailable: 0 };
          try { beds = JSON.parse(h.beds); } catch { beds = { total: 0, occupied: 0, available: 0, icu: 0, icuAvailable: 0 }; }
          let specs: string[] = [];
          try { specs = JSON.parse(h.specialties); } catch { specs = []; }
          return {
            id: h.id,
            name: h.name,
            address: h.address,
            city: h.city,
            state: h.state,
            phone: h.phone,
            website: h.website,
            specialties: specs,
            beds,
            emergency: h.emergency,
            location: { lat: h.lat, lng: h.lng },
            rating: h.rating,
            image: h.image,
            workingHours: h.workingHours,
            doctors: h.doctors,
            source: 'database',
            distance: parseFloat(distance.toFixed(2)),
          };
        })
        .filter(h => h.distance <= radius / 1000)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 50);

      if (withDistance.length > 0) {
        return NextResponse.json({ hospitals: withDistance, count: withDistance.length, source: 'database' });
      }
    }

    const overpassQuery = `
      [out:json][timeout:15];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        way["amenity"="hospital"](around:${radius},${lat},${lng});
      );
      out center 20;`;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      headers: { 'Content-Type': 'text/plain' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({ hospitals: [], count: 0, source: 'none' });
    }

    const data = await response.json();
    const hospitals2 = data.elements
      .filter((el: any) => el.tags?.name)
      .map((el: any) => {
        const elLat = el.lat || el.center?.lat || lat;
        const elLng = el.lon || el.center?.lon || lng;
        const distance = getDistanceKm(lat, lng, elLat, elLng);
        return {
          id: `osm_${el.id}`,
          name: el.tags.name,
          address: [el.tags['addr:housenumber'], el.tags['addr:street']].filter(Boolean).join(', ') || '',
          city: el.tags['addr:city'] || '',
          state: el.tags['addr:state'] || '',
          phone: el.tags.phone || '',
          specialties: el.tags['healthcare:speciality'] ? el.tags['healthcare:speciality'].split(';') : ['General Medicine'],
          beds: { total: 0, occupied: 0, available: 0, icu: 0, icuAvailable: 0 },
          emergency: el.tags.emergency === 'yes' || el.tags.amenity === 'hospital',
          location: { lat: elLat, lng: elLng },
          rating: 0,
          source: 'openstreetmap',
          distance: parseFloat(distance.toFixed(2)),
        };
      })
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 50);

    return NextResponse.json({ hospitals: hospitals2, count: hospitals2.length, source: 'openstreetmap' });
  } catch (error) {
    console.error('Nearby hospitals error:', error);
    return NextResponse.json({ hospitals: [], count: 0, source: 'error' }, { status: 500 });
  }
}
