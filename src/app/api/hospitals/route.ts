import { NextRequest, NextResponse } from 'next/server';
import { getDistanceKm } from '@/utils/distance';

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

async function fetchFromOverpass(lat: number, lng: number, radiusM: number) {
  const radius = Math.min(radiusM, 50000);
  const query = `[out:json][timeout:25];(
    node(around:${radius},${lat},${lng})[amenity=hospital];
    way(around:${radius},${lat},${lng})[amenity=hospital];
    relation(around:${radius},${lat},${lng})[amenity=hospital];
  );out center 30;`;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'ZyntraCare/1.0' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = await res.json();
  return data.elements || [];
}

const SPECIALTIES_LIST = ['Cardiology','Neurology','Orthopedics','Pediatrics','Gynecology','Dermatology','Ophthalmology','Psychiatry','General Medicine','ENT','Dentistry','Urology','Oncology','Gastroenterology','Pulmonology'];

function getHospitalSpecialties(tags: any): string[] {
  const t = tags?.healthcare || tags?.medical || '';
  if (!t) return ['General Medicine'];
  const map: Record<string, string> = {
    hospital: 'General Medicine', clinic: 'General Medicine',
    cardiology: 'Cardiology', neurology: 'Neurology', orthopedics: 'Orthopedics',
    pediatrics: 'Pediatrics', gynecology: 'Gynecology', dermatology: 'Dermatology',
    ophthalmology: 'Ophthalmology', psychiatry: 'Psychiatry', ENT: 'ENT',
    dentistry: 'Dentistry', urology: 'Urology', oncology: 'Oncology',
  };
  const found = Object.entries(map).find(([k]) => t.includes(k));
  return found ? [found[1]] : ['General Medicine'];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const search = searchParams.get('q') || '';
  const specialty = searchParams.get('specialty') || '';
  const radius = parseInt(searchParams.get('radius') || '15000');
  const limit = parseInt(searchParams.get('limit') || '0');

  try {
    let overpassResults: any[] = [];
    try {
      const elements = await fetchFromOverpass(lat, lng, Math.max(radius, 5000));
      if (elements.length > 0) {
        overpassResults = elements
          .filter((el: any) => {
            const elLat = el.lat ?? el.center?.lat;
            const elLng = el.lon ?? el.center?.lon;
            return elLat && elLng;
          })
          .map((el: any, i: number) => {
            const elLat = el.lat ?? el.center?.lat;
            const elLng = el.lon ?? el.center?.lon;
            const distance = getDistanceKm(lat, lng, elLat, elLng);
            const name = el.tags?.name || el.tags?.['name:en'] || 'Hospital';
            return {
              id: `osm-${el.id || i}`,
              name,
              address: [el.tags?.['addr:houseno'], el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || '',
              city: el.tags?.['addr:city'] || '',
              state: el.tags?.['addr:state'] || '',
              phone: el.tags?.phone || el.tags?.['contact:phone'] || '',
              location: { lat: elLat, lng: elLng },
              rating: el.tags?.rating ? parseFloat(el.tags.rating) : 4.0 + Math.random() * 0.8,
              beds: { total: 0, available: 0, icu: 0, icuAvailable: 0 },
              specialties: getHospitalSpecialties(el.tags || {}),
              emergency: el.tags?.emergency === 'yes',
              verified: true,
              doctors: 0,
              image: getHospitalImage(name),
              workingHours: el.tags?.['opening_hours'] || '24/7',
              distance: parseFloat(distance.toFixed(2)),
              source: 'overpass',
            };
          })
          .sort((a: any, b: any) => a.distance - b.distance);
      }
    } catch (err) {
      console.warn('Overpass hospitals failed:', (err as Error).message);
    }

    let filtered = overpassResults;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((h: any) =>
        h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)
      );
    }
    if (specialty) {
      filtered = filtered.filter((h: any) =>
        h.specialties.some((s: string) => s.toLowerCase().includes(specialty.toLowerCase()))
      );
    }

    const cities = [...new Set(overpassResults.map((h: any) => h.city).filter(Boolean))].sort() as string[];

    if (filtered.length === 0) {
      filtered = FALLBACK_HOSPITALS;
    }

    if (limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    return NextResponse.json({
      hospitals: filtered,
      total: filtered.length,
      page: 1,
      pages: 1,
      cities: cities.length > 0 ? cities : ['Delhi'],
      source: overpassResults.length > 0 ? 'overpass' : 'fallback',
    });
  } catch (error) {
    console.error('Hospitals API error:', error);
    return NextResponse.json({ hospitals: [], total: 0, page: 1, pages: 0, cities: [], source: 'error' }, { status: 500 });
  }
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
