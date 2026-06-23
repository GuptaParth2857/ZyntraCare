import { NextRequest, NextResponse } from 'next/server';
import { getDistanceKm } from '@/utils/distance';
import { generateNearbyAll } from '@/utils/fallback';

const HOSPITAL_IMAGES = [
  'https://images.unsplash.com/photo-1764885449332-7eb941d53b7e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1764885518098-781b23d50e7f?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1764885415563-8b868745e9e2?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1769698678497-c41f0ab47c3e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1720608594472-bc29045eef28?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1720463903383-c45df62da719?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1627372043170-f9cf2706f5f2?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1769147555720-71fc71bfc216?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800',
];

function getHospitalImage(name: string): string {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return HOSPITAL_IMAGES[hash % HOSPITAL_IMAGES.length];
}

// Helper to query Overpass API for real nearby places
async function fetchFromOverpass(lat: number, lng: number, radiusM: number, filterType: string) {
  const radius = Math.min(radiusM, 50000); // cap at 50km

  let queries = '';
  if (filterType === 'all' || filterType === 'hospital') {
    queries += `node["amenity"="hospital"](around:${radius},${lat},${lng});
way["amenity"="hospital"](around:${radius},${lat},${lng});
node["amenity"="clinic"](around:${radius},${lat},${lng});
way["amenity"="clinic"](around:${radius},${lat},${lng});`;
  }
  if (filterType === 'all' || filterType === 'pharmacy') {
    queries += `node["amenity"="pharmacy"](around:${radius},${lat},${lng});
node["shop"="chemist"](around:${radius},${lat},${lng});`;
  }
  if (filterType === 'all' || filterType === 'lab') {
    queries += `node["amenity"="laboratory"](around:${radius},${lat},${lng});
node["healthcare"="laboratory"](around:${radius},${lat},${lng});
node["amenity"="doctors"](around:${radius},${lat},${lng});`;
  }

  const query = `[out:json][timeout:30];(${queries});out center 60;`;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'ZyntraCare/1.0 (healthcare platform)',
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Overpass API error: ${res.status} ${text.slice(0, 100)}`);
  }
  const data = await res.json();
  return data.elements || [];
}

function determineType(el: any): 'hospital' | 'clinic' | 'pharmacy' | 'lab' {
  const amenity = el.tags?.amenity;
  const shop = el.tags?.shop;
  const healthcare = el.tags?.healthcare;

  if (amenity === 'hospital') return 'hospital';
  if (amenity === 'clinic' || amenity === 'doctors') return 'clinic';
  if (amenity === 'pharmacy' || shop === 'chemist') return 'pharmacy';
  if (amenity === 'laboratory' || healthcare === 'laboratory') return 'lab';
  return 'hospital';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const radiusM = parseInt(searchParams.get('radius') || '10000');
  const radiusKm = radiusM / 1000;
  const type = searchParams.get('type') as 'all' | 'hospital' | 'lab' | 'pharmacy' | null;
  const filterType = type || 'all';

  // Try database first (exact radius only)
  let dbResults: any[] = [];
  try {
    const prisma = (await import('@/lib/prisma')).default;

    if (filterType === 'all' || filterType === 'hospital') {
      const hospitals = await prisma.hospital.findMany({
        where: { verified: true, lat: { not: 0 }, lng: { not: 0 } },
        take: 100,
      });
      for (const h of hospitals) {
        if (!h.lat || !h.lng) continue;
        const distance = getDistanceKm(lat, lng, h.lat, h.lng);
        if (distance > radiusKm) continue;
        let beds = { total: 0, occupied: 0, available: 0, icu: 0, icuAvailable: 0 };
        try { beds = JSON.parse(h.beds); } catch {}
        let specs: string[] = [];
        try { specs = JSON.parse(h.specialties); } catch {}
        dbResults.push({
          id: h.id, name: h.name, type: 'hospital',
          address: h.address, city: h.city, state: h.state,
          phone: h.phone, website: h.website, specialties: specs, beds,
          emergency: h.emergency,
          location: { lat: h.lat, lng: h.lng },
          rating: h.rating, image: h.image, workingHours: h.workingHours,
          distance: parseFloat(distance.toFixed(1)),
        });
      }
    }

    if (filterType === 'all' || filterType === 'lab') {
      const labs = await prisma.lab.findMany({
        where: { lat: { not: 0 }, lng: { not: 0 } }, take: 100,
      });
      for (const l of labs) {
        if (!l.lat || !l.lng) continue;
        const distance = getDistanceKm(lat, lng, l.lat, l.lng);
        if (distance > radiusKm) continue;
        let tests: string[] = [];
        try { tests = JSON.parse(l.tests); } catch {}
        dbResults.push({
          id: l.id, name: l.name, type: 'lab',
          address: l.address, city: l.city, phone: l.phone,
          location: { lat: l.lat, lng: l.lng },
          rating: l.rating, workingHours: l.workingHours,
          distance: parseFloat(distance.toFixed(1)),
        });
      }
    }

    if (filterType === 'all' || filterType === 'pharmacy') {
      const pharmacies = await prisma.pharmacy.findMany({
        where: { lat: { not: 0 }, lng: { not: 0 } }, take: 100,
      });
      for (const p of pharmacies) {
        if (!p.lat || !p.lng) continue;
        const distance = getDistanceKm(lat, lng, p.lat, p.lng);
        if (distance > radiusKm) continue;
        dbResults.push({
          id: p.id, name: p.name, type: 'pharmacy',
          address: p.address, city: p.city, phone: p.phone,
          location: { lat: p.lat, lng: p.lng },
          rating: p.rating, workingHours: p.workingHours,
          open24Hours: p.open24Hours,
          distance: parseFloat(distance.toFixed(1)),
        });
      }
    }
  } catch (err) {
    console.warn('Database query failed, falling back to Overpass:', err);
  }

  // Overpass — real nearby places (always try, merges with DB results)
  let overpassResults: any[] = [];
  {
    try {
      const elements = await fetchFromOverpass(lat, lng, Math.max(radiusM, 5000), filterType);

      overpassResults = elements
        .filter((el: any) => el.lat || el.center?.lat)
        .map((el: any) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLng = el.lon ?? el.center?.lon;
          const distance = parseFloat(getDistanceKm(lat, lng, elLat, elLng).toFixed(1));
          const type = determineType(el);
          const name = el.tags?.name || el.tags?.['name:en'] ||
            (type === 'hospital' ? 'Hospital' :
             type === 'clinic' ? 'Clinic' :
             type === 'pharmacy' ? 'Pharmacy' : 'Lab');

          return {
            id: `op-${el.id}`,
            name,
            type,
            address: [
              el.tags?.['addr:houseno'],
              el.tags?.['addr:street'],
              el.tags?.['addr:city'],
            ].filter(Boolean).join(', ') || el.tags?.['addr:full'] || '',
            city: el.tags?.['addr:city'] || '',
            phone: el.tags?.phone || el.tags?.['contact:phone'] || '',
            website: el.tags?.website || el.tags?.['contact:website'] || '',
            specialties: [],
            emergency: el.tags?.emergency === 'yes' || type === 'hospital',
            location: { lat: elLat, lng: elLng },
            rating: 0,
            workingHours: el.tags?.opening_hours || '',
            image: getHospitalImage(name),
            distance,
          };
        })
        .filter((p: any) => p.distance <= radiusKm)
        .sort((a: any, b: any) => a.distance - b.distance);
    } catch (overpassErr) {
      console.warn('Overpass API error:', overpassErr);
    }
  }

  // Dynamic fallback — fills gaps so users always see enough results
  const fallbackAll = generateNearbyAll(lat, lng, radiusKm, filterType);

  // Merge DB + Overpass + Fallback (deduped)
  const merged = [...dbResults, ...overpassResults, ...fallbackAll]
    .filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.name === p.name) === i)
    .sort((a: any, b: any) => a.distance - b.distance);

  const sourceLabel = overpassResults.length > 0 ? 'overpass'
    : dbResults.length > 0 ? 'database'
    : 'fallback';

  return NextResponse.json({
    hospitals: merged, count: merged.length, source: sourceLabel,
    types: {
      hospital: merged.filter((r: any) => r.type === 'hospital').length,
      lab: merged.filter((r: any) => r.type === 'lab').length,
      pharmacy: merged.filter((r: any) => r.type === 'pharmacy').length,
    },
  });
}
