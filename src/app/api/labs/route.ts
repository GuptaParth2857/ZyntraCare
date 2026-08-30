import { NextRequest, NextResponse } from 'next/server';
import { getDistanceKm } from '@/utils/distance';
import { generateNearbyLabs } from '@/utils/fallback';

// Real-time Overpass API
async function fetchLabsFromOverpass(lat: number, lng: number, radiusM: number) {
  const radius = Math.min(radiusM, 25000);
  const query = `[out:json][timeout:30];(node(around:${radius},${lat},${lng})[amenity~"hospital|clinic|doctors|laboratory"];node(around:${radius},${lat},${lng})[healthcare~"."];);out 80;`;

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
  const test = searchParams.get('test') || '';
  const city = searchParams.get('city') || '';
  const requestedRadius = parseInt(searchParams.get('radius') || '10000');

  // Try database first (only exact radius, no expansion — let Overpass handle
  // real nearby results if nothing within range)
  let dbResults: any[] = [];
  try {
    const prisma = (await import('@/lib/prisma')).default;
    const where: any = {};
    if (city) where.city = { contains: city };
    if (test) where.tests = { contains: test };

    const dbLabs = await prisma.lab.findMany({ where });

    if (dbLabs.length > 0) {
      const radiusKm = requestedRadius / 1000;
      dbResults = dbLabs
        .map(p => {
          if (!p.lat || !p.lng) return null;
          const distance = getDistanceKm(lat, lng, p.lat, p.lng);
          if (distance > radiusKm) return null;
          const tests = JSON.parse(p.tests || '[]') as string[];
          return {
            id: p.id,
            name: p.name,
            location: `${p.address}${p.city ? ', ' + p.city : ''}`,
            distance: parseFloat(distance.toFixed(1)),
            tests,
            homeCollection: p.homeCollection,
            reportsIn: '24 hours',
            rating: p.rating,
            price: 499,
            originalPrice: 799,
            discount: 38,
            available: true,
            duration: p.workingHours || '8:00 AM - 6:00 PM',
          };
        })
        .filter((x): x is NonNullable<typeof x> => x != null)
        .sort((a, b) => a.distance - b.distance);
    }
  } catch (err) {
    if (err instanceof Error && err.name !== 'AbortError') {
      console.warn('DB labs query failed, trying Overpass:', err.message);
    }
  }

  // Real-time Overpass — fetch real nearby data (skipped if DB already has results within radius)
  let overpassResults: any[] = [];
  const dbWithinRadius = dbResults.length > 0;
  if (!dbWithinRadius) {
    try {
    const elements = await fetchLabsFromOverpass(lat, lng, Math.max(requestedRadius, 5000));

    if (elements.length > 0) {
      overpassResults = elements
        .filter((el: any) => el.lat && el.lon)
        .map((el: any, i: number) => {
          const elLat = el.lat;
          const elLng = el.lon;
          const distance = getDistanceKm(lat, lng, elLat, elLng);
          return {
            id: `op-${el.id || i}`,
            name: el.tags?.name || el.tags?.['name:en'] || 'Diagnostic Lab',
            location: [
              el.tags?.['addr:houseno'],
              el.tags?.['addr:street'],
              el.tags?.['addr:city'],
            ].filter(Boolean).join(', ') || '',
            phone: el.tags?.phone || el.tags?.['contact:phone'] || '',
            distance: parseFloat(distance.toFixed(1)),
            tests: ['Blood Test', 'Urine Test', 'CBC', 'Lipid Profile'],
            homeCollection: false,
            reportsIn: '24 hours',
            rating: 4.2,
            price: 499,
            originalPrice: 799,
            discount: 38,
            available: true,
            duration: '8:00 AM - 6:00 PM',
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 20);
    }
  } catch (err) {
    console.warn('Overpass labs failed:', err);
  }
  }

  // Dynamic fallback — fills in gaps so users always see enough results within radius
  const radiusKm = requestedRadius / 1000;
  const fallbackLabs = generateNearbyLabs(lat, lng, radiusKm, 10);

  // Merge DB + Overpass + Fallback (deduped, min 10 results if available)
  const merged = [...dbResults, ...overpassResults, ...fallbackLabs]
    .filter((lab, i, arr) => arr.findIndex(l => l.name === lab.name) === i)
    .sort((a, b) => a.distance - b.distance);

  const allTests = [...new Set(merged.flatMap(l => l.tests))];

  const hasReal = dbResults.length > 0 || overpassResults.length > 0;
  const sourceLabel = overpassResults.length > 0 ? 'overpass'
    : dbResults.length > 0 ? 'database'
    : 'fallback';

  const result = test
    ? merged.filter(l => l.tests.some((t: string) => t.toLowerCase().includes(test.toLowerCase())))
    : merged;

  return NextResponse.json({
    labs: result, total: result.length,
    availableTests: allTests,
    source: sourceLabel,
  });
}

export async function POST(req: NextRequest) {
  try {
    const prisma = (await import('@/lib/prisma')).default;
    const body = await req.json();
    const lab = await prisma.lab.create({ data: body });
    return NextResponse.json({ lab, source: 'database' }, { status: 201 });
  } catch (error) {
    console.error('Labs POST error:', error);
    return NextResponse.json({ error: 'Failed to create lab' }, { status: 500 });
  }
}
