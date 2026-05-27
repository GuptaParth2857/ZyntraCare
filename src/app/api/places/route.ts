import { NextRequest, NextResponse } from 'next/server';
import { getDistanceKm } from '@/utils/distance';

async function fetchPlacesFromOSM(lat: number, lng: number, radius: number = 10000) {
  // Query for various place types: shops, malls, restaurants, etc.
  const query = `[out:json][timeout:15];
    (
      node["shop"](around:${radius},${lat},${lng});
      node["amenity"="restaurant"](around:${radius},${lat},${lng});
      node["amenity"="cafe"](around:${radius},${lat},${lng});
      node["amenity"="fast_food"](around:${radius},${lat},${lng});
      node["shop"="mall"](around:${radius},${lat},${lng});
      node["amenity"="fuel"](around:${radius},${lat},${lng});
      node["amenity"="bank"](around:${radius},${lat},${lng});
      node["amenity"="pharmacy"](around:${radius},${lat},${lng});
      way["shop"](around:${radius},${lat},${lng});
      way["amenity"="restaurant"](around:${radius},${lat},${lng});
      way["shop"="mall"](around:${radius},${lat},${lng});
    );
    out center 50;`;

  try {
    const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => {
        const placeLat = el.lat ?? el.center?.lat;
        const placeLng = el.lon ?? el.center?.lon;
        return {
          id: `OSM_${el.id}`,
          name: el.tags.name,
          type: el.tags.shop || el.tags.amenity || 'place',
          location: { lat: placeLat, lng: placeLng },
          address: el.tags['addr:full'] || `${el.tags['addr:housenumber']} ${el.tags['addr:street']}`.trim() || `${el.tags['addr:city'] || ''}, ${el.tags['addr:state'] || ''}`.trim(),
          city: el.tags['addr:city'] || 'Nearby',
          distance: getDistanceKm(lat, lng, placeLat, placeLng),
        };
      })
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 30);
  } catch (e) {
    console.error('OSM places fetch error:', e);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseInt(searchParams.get('radius') || '10000');
  const type = searchParams.get('type');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude required' }, { status: 400 });
  }

  const places = await fetchPlacesFromOSM(lat, lng, radius);
  
  if (!places) {
    // Return empty array if fetch fails
    return NextResponse.json({ places: [], total: 0 });
  }

  // Filter by type if specified
  let filteredPlaces = places;
  if (type) {
    filteredPlaces = places.filter((p: any) => 
      p.type === type || 
      (p.type && p.type.includes(type)) ||
      (type && p.type.toLowerCase().includes(type.toLowerCase()))
    );
  }

  const response = {
    places: filteredPlaces,
    total: filteredPlaces.length,
  };

  return NextResponse.json(response);
}