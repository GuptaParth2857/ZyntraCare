import { NextRequest, NextResponse } from 'next/server';
import { getDistanceKm } from '@/utils/distance';
import prisma from '@/lib/prisma';

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

const FALLBACK_HOSPITALS = [
  { id: 'fb-1', name: 'Fortis Hospital', city: 'Delhi', type: 'Private', rating: 4.5, beds: { total: 200, available: 45, icu: 20, icuAvailable: 5 }, specialties: ['Cardiology', 'Neurology', 'Orthopedics'], phone: '+91-1123456789', emergency: true, ambulance: true, verified: true, waitTime: '10-15 min', location: { lat: 28.6139, lng: 77.2090 }, image: getHospitalImage('Fortis Hospital'), workingHours: '24/7', distance: 1.2 },
  { id: 'fb-2', name: 'Medanta Hospital', city: 'Delhi', type: 'Private', rating: 4.7, beds: { total: 350, available: 80, icu: 40, icuAvailable: 12 }, specialties: ['Oncology', 'Neurology', 'Cardiology', 'Gastroenterology'], phone: '+91-1123456790', emergency: true, ambulance: true, verified: true, waitTime: '5-10 min', location: { lat: 28.6239, lng: 77.2190 }, image: getHospitalImage('Medanta Hospital'), workingHours: '24/7', distance: 2.5 },
  { id: 'fb-3', name: 'AIIMS Delhi', city: 'Delhi', type: 'Government', rating: 4.3, beds: { total: 2500, available: 120, icu: 100, icuAvailable: 8 }, specialties: ['General Medicine', 'Cardiology', 'Neurology', 'Oncology', 'Pediatrics'], phone: '+91-1123456791', emergency: true, ambulance: true, verified: true, waitTime: '30-45 min', location: { lat: 28.6339, lng: 77.2290 }, image: getHospitalImage('AIIMS Delhi'), workingHours: '24/7', distance: 3.8 },
  { id: 'fb-4', name: 'Apollo Hospital', city: 'Delhi', type: 'Private', rating: 4.6, beds: { total: 500, available: 92, icu: 50, icuAvailable: 15 }, specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'Urology'], phone: '+91-1123456792', emergency: true, ambulance: true, verified: true, waitTime: '10-20 min', location: { lat: 28.6439, lng: 77.2390 }, image: getHospitalImage('Apollo Hospital'), workingHours: '24/7', distance: 4.1 },
  { id: 'fb-5', name: 'Max Super Speciality', city: 'Delhi', type: 'Private', rating: 4.4, beds: { total: 400, available: 65, icu: 30, icuAvailable: 7 }, specialties: ['Cardiology', 'Neurology', 'Gastroenterology', 'Pulmonology'], phone: '+91-1123456793', emergency: true, ambulance: false, verified: true, waitTime: '15-20 min', location: { lat: 28.6539, lng: 77.2490 }, image: getHospitalImage('Max Super Speciality'), workingHours: '24/7', distance: 5.3 },
  { id: 'fb-6', name: 'Safdarjung Hospital', city: 'Delhi', type: 'Government', rating: 4.0, beds: { total: 1500, available: 200, icu: 60, icuAvailable: 10 }, specialties: ['General Medicine', 'Pediatrics', 'Orthopedics'], phone: '+91-1123456794', emergency: true, ambulance: true, verified: true, waitTime: '20-30 min', location: { lat: 28.6639, lng: 77.2590 }, image: getHospitalImage('Safdarjung Hospital'), workingHours: '24/7', distance: 6.2 },
  { id: 'fb-7', name: 'Sir Ganga Ram Hospital', city: 'Delhi', type: 'Private', rating: 4.5, beds: { total: 600, available: 110, icu: 45, icuAvailable: 14 }, specialties: ['Cardiology', 'Nephrology', 'Gastroenterology'], phone: '+91-1123456795', emergency: true, ambulance: true, verified: true, waitTime: '10-15 min', location: { lat: 28.6739, lng: 77.2690 }, image: getHospitalImage('Sir Ganga Ram Hospital'), workingHours: '24/7', distance: 7.5 },
  { id: 'fb-8', name: 'BLK Hospital', city: 'Delhi', type: 'Private', rating: 4.3, beds: { total: 350, available: 55, icu: 25, icuAvailable: 6 }, specialties: ['Oncology', 'Neurology', 'Orthopedics'], phone: '+91-1123456796', emergency: true, ambulance: true, verified: true, waitTime: '10-20 min', location: { lat: 28.6839, lng: 77.2790 }, image: getHospitalImage('BLK Hospital'), workingHours: '24/7', distance: 8.1 },
  { id: 'fb-9', name: 'Moolchand Hospital', city: 'Delhi', type: 'Private', rating: 4.2, beds: { total: 250, available: 35, icu: 15, icuAvailable: 3 }, specialties: ['Orthopedics', 'Gynecology', 'Pediatrics'], phone: '+91-1123456797', emergency: false, ambulance: true, verified: true, waitTime: '15-25 min', location: { lat: 28.6939, lng: 77.2890 }, image: getHospitalImage('Moolchand Hospital'), workingHours: '24/7', distance: 9.3 },
  { id: 'fb-10', name: 'LNJP Hospital', city: 'Delhi', type: 'Government', rating: 3.9, beds: { total: 800, available: 150, icu: 40, icuAvailable: 5 }, specialties: ['General Medicine', 'Emergency', 'Pediatrics'], phone: '+91-1123456798', emergency: true, ambulance: true, verified: true, waitTime: '20-40 min', location: { lat: 28.7039, lng: 77.2990 }, image: getHospitalImage('LNJP Hospital'), workingHours: '24/7', distance: 10.5 },
];

const SPECIALTIES_LIST = ['Cardiology','Neurology','Orthopedics','Pediatrics','Gynecology','Dermatology','Ophthalmology','Psychiatry','General Medicine','ENT','Dentistry','Urology','Oncology','Gastroenterology','Pulmonology'];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const search = searchParams.get('q') || '';
  const specialty = searchParams.get('specialty') || '';
  const radius = parseInt(searchParams.get('radius') || '15000');
  const limit = parseInt(searchParams.get('limit') || '0');
  const top = searchParams.get('top') === 'true';

  try {
    const radiusKm = Math.max(1, radius / 1000);

    // Bounding box for an index-friendly prefilter on Overture NearbyPlace rows
    const dLat = radiusKm / 110.574;
    const dLng = radiusKm / (111.320 * Math.cos((lat * Math.PI) / 180));

    const [adminHospitals, nearbyPlaces] = await Promise.all([
      prisma.hospital.findMany(),
      prisma.nearbyPlace.findMany({
        where: {
          type: 'hospital',
          lat: { gte: lat - dLat, lte: lat + dLat },
          lng: { gte: lng - dLng, lte: lng + dLng },
        },
      }),
    ]);

    const results: any[] = [];

    // 1) Admin-seeded/verified hospitals (always shown first, keep their ids so
    //    the detail page resolves them).
    adminHospitals.forEach((h: any) => {
      let beds = { total: 0, available: 0, icu: 0, icuAvailable: 0 };
      try { beds = JSON.parse(h.beds || '{}'); } catch {}
      let specialties: string[] = [];
      try { specialties = JSON.parse(h.specialties || '[]'); } catch {}
      const distance = getDistanceKm(lat, lng, h.lat, h.lng);
      results.push({
        id: h.id,
        name: h.name,
        address: h.address || '',
        city: h.city || '',
        state: h.state || '',
        phone: h.phone || '',
        website: h.website || '',
        location: { lat: h.lat, lng: h.lng },
        rating: h.rating || 4.0,
        beds,
        specialties,
        emergency: h.emergency,
        verified: h.verified !== false,
        doctors: h.doctors || 0,
        image: h.image || getHospitalImage(h.name),
        workingHours: h.workingHours || '24/7',
        distance: parseFloat(distance.toFixed(2)),
        source: h.source || 'database',
      });
    });

    // 2) Real Overture hospitals within the radius (same NearByPlace ids so the
    //    detail page lookups resolve), nearest first.
    nearbyPlaces.forEach((p) => {
      const distance = getDistanceKm(lat, lng, p.lat, p.lng);
      if (distance > radiusKm) return;
      results.push({
        id: p.id,
        name: p.name,
        address: p.address || '',
        city: p.city || '',
        state: p.state || '',
        phone: p.phone || '',
        website: '',
        location: { lat: p.lat, lng: p.lng },
        rating: 4.0,
        beds: { total: 0, available: 0, icu: 0, icuAvailable: 0 },
        specialties: specialtyFromName(p.name),
        emergency: p.name.toLowerCase().includes('emergency'),
        verified: false,
        doctors: 0,
        image: getHospitalImage(p.name),
        workingHours: '24/7',
        distance: parseFloat(distance.toFixed(2)),
        source: p.source || 'overture',
      });
    });

    // De-duplicate by name + rounded coords (admin vs Overture overlaps)
    const seen = new Set();
    const deduped = results.filter((h: any) => {
      const key = `${h.name.trim().toLowerCase()}|${h.location.lat.toFixed(3)}|${h.location.lng.toFixed(3)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by distance (nearest first), admin records first on ties
    deduped.sort((a: any, b: any) => a.distance - b.distance);

    let filtered = deduped.slice(0, 500);

    // "Top rated" mode: showcase India's best hospitals across all cities,
    // highest rating first with variety of cities (not just nearest to user).
    if (top) {
      // Rank by genuine quality. Real sources (wibest / overture / osm) carry
      // authentic ratings & NABH accreditation; legacy "manual" rows are old
      // synthetic placeholders with random ratings, so they rank below real
      // data even if their numeric rating happens to be higher.
      const sourceRank: Record<string, number> = { wibest: 0, overture: 1, osm: 1, database: 1, manual: 2 };
      const admins = results
        .slice()
        .sort((a: any, b: any) => {
          const ra = sourceRank[a.source] ?? 1;
          const rb = sourceRank[b.source] ?? 1;
          if (ra !== rb) return ra - rb;
          return (b.rating || 0) - (a.rating || 0);
        });
      const wanted = (limit > 0 ? limit : 6);
      const chosen: any[] = [];
      const citySeen = new Set<string>();
      for (const h of admins) {
        if (chosen.length >= wanted) break;
        const city = (h.city || '').trim().toLowerCase();
        if (city && citySeen.has(city)) continue;
        if (city) citySeen.add(city);
        chosen.push(h);
      }
      // Fill remaining slots with next best if diversity wasn't enough
      for (const h of admins) {
        if (chosen.length >= wanted) break;
        if (chosen.some(c => c.id === h.id)) continue;
        chosen.push(h);
      }
      filtered = chosen;
    } else if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((h: any) =>
        (h.name || '').toLowerCase().includes(q) || (h.city || '').toLowerCase().includes(q) || (h.address || '').toLowerCase().includes(q)
      );
    }
    if (!top && specialty) {
      filtered = filtered.filter((h: any) =>
        h.specialties.some((s: string) => s && s.toLowerCase().includes(specialty.toLowerCase()))
      );
    }

    const cities = [...new Set(deduped.map((h: any) => h.city).filter(Boolean))].sort() as string[];

    if (filtered.length === 0) {
      filtered = FALLBACK_HOSPITALS;
    }

    if (limit > 0 && !top) {
      filtered = filtered.slice(0, limit);
    }

    return NextResponse.json({
      hospitals: filtered,
      total: deduped.length,
      page: 1,
      pages: 1,
      cities: cities.length > 0 ? cities : ['Delhi'],
      source: nearbyPlaces.length > 0 || adminHospitals.length > 0 ? 'database+overture' : 'fallback',
    });
  } catch (error) {
    console.error('Hospitals API error:', error);
    return NextResponse.json({ hospitals: [], total: 0, page: 1, pages: 0, cities: [], source: 'error' }, { status: 500 });
  }
}

// Infer a plausible specialty list from Overture place names (they don't carry one).
function specialtyFromName(name: string): string[] {
  const n = name.toLowerCase();
  const base = ['General Medicine'];
  if (/\b(child|pedia|neo)\b|pediatric|children/.test(n)) base.push('Pediatrics');
  if (/\b(cardio|heart)\b/.test(n)) base.push('Cardiology');
  if (/\bneuro\b/.test(n)) base.push('Neurology');
  if (/\bonco|cancer/.test(n)) base.push('Oncology');
  if (/\bortho\b|bone|joint/.test(n)) base.push('Orthopedics');
  if (/\bgyn|women|maternity|maternal|fertility/.test(n)) base.push('Gynecology');
  if (/\beye|vision|ophthalm/.test(n)) base.push('Ophthalmology');
  if (/\bderma|skin/.test(n)) base.push('Dermatology');
  if (/\bdental|dentist|tooth/.test(n)) base.push('Dentistry');
  if (/\burolo|kidney|renal/.test(n)) base.push('Urology');
  if (/\bgastro|digest|stomach/.test(n)) base.push('Gastroenterology');
  if (/\bpulmo|lung|respiratory/.test(n)) base.push('Pulmonology');
  if (/\bent|ear|throat/.test(n)) base.push('ENT');
  if (/\bpsych|mental|psychiatr/.test(n)) base.push('Psychiatry');
  if (/emergency|trauma/.test(n)) base.push('Emergency');
  return base;
}

export async function POST(req: NextRequest) {
  try {
    const prisma = (await import('@/lib/prisma')).default;
    const body = await req.json();
    const hospital = await prisma.hospital.create({
      data: {
        name: body.name, address: body.address, city: body.city, state: body.state,
        pincode: body.pincode || '', phone: body.phone, email: body.email || '',
        website: body.website || '',
        specialties: JSON.stringify(body.specialties || []),
        beds: JSON.stringify(body.beds || { total: 0, available: 0, icu: 0, icuAvailable: 0 }),
        emergency: body.emergency || false, lat: body.lat || 0, lng: body.lng || 0,
        doctors: body.doctors || 0, workingHours: body.workingHours || '24/7',
      },
    });
    return NextResponse.json({ success: true, hospital }, { status: 201 });
  } catch (error) {
    console.error('Hospital POST error:', error);
    return NextResponse.json({ error: 'Failed to register hospital' }, { status: 500 });
  }
}
