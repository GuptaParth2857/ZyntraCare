import { NextRequest, NextResponse } from 'next/server';
import { getDistanceKm } from '@/utils/distance';
import { generateNearbyPharmacies } from '@/utils/fallback';

async function fetchPharmaciesFromOverpass(lat: number, lng: number, radiusM: number) {
  const radius = Math.min(radiusM, 25000);
  const query = `[out:json][timeout:30];(node(around:${radius},${lat},${lng})[amenity~"pharmacy|chemist"];node(around:${radius},${lat},${lng})[shop="chemist"];node(around:${radius},${lat},${lng})[healthcare="pharmacy"];);out 80;`;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'ZyntraCare/1.0',
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Overpass error: ${res.status} ${text.slice(0, 100)}`);
  }
  const data = await res.json();
  return data.elements || [];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const radius = parseInt(searchParams.get('radius') || '10000');

  // Try database first (only exact radius, no expansion)
  let dbResults: any[] = [];
  try {
    const prisma = (await import('@/lib/prisma')).default;
    const where: any = {};
    if (city) where.city = { contains: city };

    const dbPharmacies = await prisma.pharmacy.findMany({ where });

    if (dbPharmacies.length > 0) {
      const radiusKm = radius / 1000;
      dbResults = dbPharmacies
        .map(p => {
          if (!p.lat || !p.lng) return null;
          const distance = getDistanceKm(lat, lng, p.lat, p.lng);
          if (distance > radiusKm) return null;
          return {
            id: p.id,
            name: p.name,
            address: p.address,
            city: p.city,
            phone: p.phone,
            location: { lat: p.lat, lng: p.lng },
            distance: parseFloat(distance.toFixed(1)),
            open24x7: p.open24Hours,
            rating: p.rating,
            deliveryAvailable: p.deliveryAvailable,
            isOnline: p.isOnline,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x != null)
        .sort((a, b) => a.distance - b.distance);

      if (search) {
        dbResults = dbResults.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      }
    }
  } catch (err) {
    console.warn('DB pharmacies query failed, trying Overpass:', err);
  }

  // Overpass — real nearby pharmacies (skipped if DB already has results)
  let overpassResults: any[] = [];
  if (dbResults.length === 0) {
    try {
      const elements = await fetchPharmaciesFromOverpass(lat, lng, Math.max(radius, 5000));

      if (elements.length > 0) {
        overpassResults = elements
          .filter((el: any) => el.lat && el.lon)
          .map((el: any, i: number) => {
            const elLat = el.lat;
            const elLng = el.lon;
            const distance = getDistanceKm(lat, lng, elLat, elLng);
            const hours = el.tags?.opening_hours || '';
            const is24 = hours.includes('24/7') || hours.includes('00:00-24:00');
            return {
              id: `op-${el.id || i}`,
              name: el.tags?.name || el.tags?.['name:en'] || 'Pharmacy',
              address: [
                el.tags?.['addr:houseno'],
                el.tags?.['addr:street'],
                el.tags?.['addr:city'],
              ].filter(Boolean).join(', ') || '',
              city: el.tags?.['addr:city'] || '',
              phone: el.tags?.phone || el.tags?.['contact:phone'] || '',
              location: { lat: elLat, lng: elLng },
              distance,
              open24x7: is24,
              rating: '4.2',
              deliveryAvailable: false,
              isOnline: false,
            };
          })
          .sort((a: any, b: any) => a.distance - b.distance)
          .slice(0, 30);

        if (search) {
          overpassResults = overpassResults.filter((p: any) =>
            p.name.toLowerCase().includes(search.toLowerCase())
          );
        }
      }
    } catch (err) {
      console.warn('Overpass pharmacies failed:', err);
    }
  }

  // Dynamic fallback — fills gaps so users always see enough results
  const radiusKm = radius / 1000;
  const fallbackPharms = generateNearbyPharmacies(lat, lng, radiusKm, 8);

  // Merge DB + Overpass + Fallback (deduped)
  const merged = [...dbResults, ...overpassResults, ...fallbackPharms]
    .filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i)
    .sort((a, b) => a.distance - b.distance);

  const hasReal = dbResults.length > 0 || overpassResults.length > 0;
  const sourceLabel = overpassResults.length > 0 ? 'overpass'
    : dbResults.length > 0 ? 'database'
    : 'fallback';

  const result = search
    ? merged.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : merged;

  return NextResponse.json({ pharmacies: result, total: result.length, source: sourceLabel });
}

export async function POST(req: NextRequest) {
  try {
    const prisma = (await import('@/lib/prisma')).default;
    const body = await req.json();
    const pharmacy = await prisma.pharmacy.create({ data: body });
    return NextResponse.json({ pharmacy, source: 'database' }, { status: 201 });
  } catch (error) {
    console.error('Pharmacy POST error:', error);
    return NextResponse.json({ error: 'Failed to create pharmacy' }, { status: 500 });
  }
}
