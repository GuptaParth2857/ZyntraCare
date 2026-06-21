import { NextRequest, NextResponse } from 'next/server';
import { getDistanceKm } from '@/utils/distance';
import { generateNearbyPetVenues } from '@/utils/fallback';

const PET_BRANDS = [
  'Paws & Claws Pet Clinic', 'Creature Comforts Pet Clinic', 'PetVet Pet Clinic',
  'Animal Wellness Pet Centre', 'Dr. Doggy Pet Hospital', 'All Creatures Pet Clinic',
  'Furry Friends Pet Clinic', 'Tails & Whiskers Pet Clinic', 'Pet Health Hub',
  'Happy Paws Pet Clinic', 'Critter Care Pet Clinic', 'PetCare Center',
];

const PET_SHOP_BRANDS = [
  'Paws & Claws Pet Store', 'Happy Tails Pet Shop', 'Pet Planet',
  'Animal Kingdom Store', 'Furry Tails Pet Supplies', 'PetMart',
  'The Pet Store', 'Puppy Love Shop', 'Feathers & Fur',
];

async function fetchFromOverpass(lat: number, lng: number, radiusM: number) {
  const radius = Math.min(radiusM, 50000);
  const query = `[out:json][timeout:25];(
node["amenity"="veterinary"](around:${radius},${lat},${lng});
way["amenity"="veterinary"](around:${radius},${lat},${lng});
node["shop"="pet"](around:${radius},${lat},${lng});
way["shop"="pet"](around:${radius},${lat},${lng});
node["shop"="animal"](around:${radius},${lat},${lng});
node["amenity"="pharmacy"]["name"~"pet|animal|vet|paws|dog|cat",i](around:${radius},${lat},${lng});
node["healthcare"="veterinary"](around:${radius},${lat},${lng});
);out center 100;`;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'ZyntraCare/1.0 (healthcare platform)',
    },
    signal: AbortSignal.timeout(25000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Overpass API error: ${res.status} ${text.slice(0, 100)}`);
  }
  const data = await res.json();
  return data.elements || [];
}

function categorizePetVenue(el: any): { category: 'vet' | 'pet_shop'; icon: string; type: 'clinic' } {
  const amenity = el.tags?.amenity;
  const shop = el.tags?.shop;
  const healthcare = el.tags?.healthcare;

  if (shop === 'pet' || shop === 'animal') {
    return { category: 'pet_shop', icon: '🐾', type: 'clinic' };
  }
  if (amenity === 'pharmacy') {
    return { category: 'pet_shop', icon: '💊', type: 'clinic' };
  }
  return { category: 'vet', icon: '🏥', type: 'clinic' };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const radiusM = parseInt(searchParams.get('radius') || '10000');
  const radiusKm = radiusM / 1000;

  let overpassResults: any[] = [];
  let source = 'fallback';
  let expanded = false;

  // Step 1: Try Overpass with user's requested radius
  async function tryOverpass(radius: number) {
    try {
      const elements = await fetchFromOverpass(lat, lng, radius);
      return elements
        .filter((el: any) => el.lat || el.center?.lat)
        .map((el: any) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLng = el.lon ?? el.center?.lon;
          const distance = parseFloat(getDistanceKm(lat, lng, elLat, elLng).toFixed(1));
          const { category, icon, type } = categorizePetVenue(el);

          const name = el.tags?.name || el.tags?.['name:en'] ||
            (category === 'vet' ? 'Pet Clinic' : 'Pet Shop');

          return {
            id: `op-${el.id}`,
            name,
            type,
            lat: elLat,
            lng: elLng,
            address: [
              el.tags?.['addr:houseno'],
              el.tags?.['addr:street'],
              el.tags?.['addr:city'],
            ].filter(Boolean).join(', ') || '',
            phone: el.tags?.phone || el.tags?.['contact:phone'] || '',
            distance,
            category,
            icon,
          };
        })
        .filter((p: any) => p.distance <= radiusKm)
        .sort((a: any, b: any) => a.distance - b.distance);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn(`Overpass timeout at ${radius}m`);
      } else {
        console.warn(`Overpass error at ${radius}m:`, err?.message || err);
      }
      return [];
    }
  }

  // Try with user's radius first
  overpassResults = await tryOverpass(radiusM);

  // Step 2: If too few real results (< 3), auto-expand to 50km
  if (overpassResults.length < 3) {
    const expandedResults = await tryOverpass(50000);
    if (expandedResults.length > overpassResults.length) {
      overpassResults = expandedResults;
      expanded = true;
    }
  }

  if (overpassResults.length > 0) {
    source = expanded ? 'overpass_expanded' : 'overpass';
  }

  // Dynamic fallback — always within original radius so locally relevant
  const fallbackResults = generateNearbyPetVenues(lat, lng, radiusKm, 20);

  // Merge Overpass + Fallback (deduped by name)
  const merged = [...overpassResults, ...fallbackResults]
    .filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.name === p.name) === i)
    .sort((a: any, b: any) => a.distance - b.distance);

  return NextResponse.json({
    venues: merged,
    count: merged.length,
    source,
    expanded,
    radiusKm,
    types: {
      vet: merged.filter((r: any) => r.category === 'vet').length,
      pet_shop: merged.filter((r: any) => r.category === 'pet_shop').length,
    },
  });
}
