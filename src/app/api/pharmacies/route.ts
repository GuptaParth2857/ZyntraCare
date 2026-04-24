import { NextRequest, NextResponse } from 'next/server';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const FALLBACK_PHARMACIES = [
  { id: 'ph_1', name: 'Apollo Pharmacy', address: 'Connaught Place', city: 'Delhi', phone: '+91-11-23456789', location: { lat: 28.6145, lng: 77.2088 }, distance: 0.5, open24x7: false, rating: '4.7' },
  { id: 'ph_2', name: 'Medplus', address: 'Janpath', city: 'Delhi', phone: '+91-11-23456790', location: { lat: 28.6128, lng: 77.2115 }, distance: 0.8, open24x7: true, rating: '4.5' },
  { id: 'ph_3', name: 'Fortuna Pharmacy', address: 'Barakhamba Road', city: 'Delhi', phone: '+91-11-23456791', location: { lat: 28.6298, lng: 77.2188 }, distance: 1.2, open24x7: false, rating: '4.3' },
  { id: 'ph_4', name: 'Health First', address: 'Nehru Place', city: 'Delhi', phone: '+91-11-23456792', location: { lat: 28.5512, lng: 77.2532 }, distance: 7.5, open24x7: false, rating: '4.6' },
  { id: 'ph_5', name: 'Life Care Pharmacy', address: 'Saket', city: 'Delhi', phone: '+91-11-23456793', location: { lat: 28.5250, lng: 77.2060 }, distance: 10.0, open24x7: true, rating: '4.4' },
  { id: 'ph_6', name: 'Wellness Store', address: 'Lajpat Nagar', city: 'Delhi', phone: '+91-11-23456794', location: { lat: 28.5680, lng: 77.2428 }, distance: 8.2, open24x7: false, rating: '4.8' },
];

function generateFallbackPharmacies(lat: number, lng: number) {
  const generateNearbyCoords = (baseLat: number, baseLng: number, offset: number) => ({
    lat: baseLat + (Math.random() - 0.5) * offset * 0.01,
    lng: baseLng + (Math.random() - 0.5) * offset * 0.01,
  });

  const locations = [
    { name: 'Apollo Pharmacy', address: 'Main Road', offset: 1.5 },
    { name: 'Medplus Health', address: 'Market Complex', offset: 2.0 },
    { name: 'City Pharmacy', address: 'Near Metro Station', offset: 2.5 },
    { name: 'Health Hub', address: 'Sector Road', offset: 3.0 },
    { name: 'Medi Care Store', address: 'Commercial Area', offset: 3.5 },
    { name: 'Wellness Pharmacy', address: 'Local Market', offset: 4.0 },
  ];

  return locations.map((loc, i) => {
    const coords = generateNearbyCoords(lat, lng, loc.offset);
    return {
      id: `ph_${i + 1}`,
      name: loc.name,
      address: loc.address,
      city: 'Nearby',
      phone: `+91-${1000000000 + i}`,
      location: coords,
      distance: calculateDistance(lat, lng, coords.lat, coords.lng),
      open24x7: i < 2,
      rating: (4 + Math.random()).toFixed(1),
    };
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const search = searchParams.get('search') || '';
  
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="pharmacy"](around:30000,${lat},${lng});
      way["amenity"="pharmacy"](around:30000,${lat},${lng});
    );
    out center 30;
  `;
  
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      headers: { 'Content-Type': 'text/plain' },
      next: { revalidate: 300 },
    });
    
    if (!response.ok) throw new Error('Overpass API error');
    
    const data = await response.json();
    
    const pharmacies = (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => {
        const pLat = el.lat ?? el.center?.lat;
        const pLng = el.lon ?? el.center?.lon;
        
        return {
          id: `pharmacy_${el.id}`,
          name: el.tags.name,
          address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', '),
          city: el.tags['addr:city'] || 'Nearby',
          phone: el.tags.phone || el.tags['contact:phone'] || '',
          location: { lat: pLat, lng: pLng },
          distance: calculateDistance(lat, lng, pLat, pLng),
          open24x7: el.tags['opening_hours'] === '24/7' || el.tags['opening_hours']?.includes('24'),
          rating: (3.5 + Math.random() * 1.5).toFixed(1),
        };
      })
      .sort((a: any, b: any) => a.distance - b.distance);
    
    if (pharmacies.length === 0) {
      const fallback = generateFallbackPharmacies(lat, lng);
      return NextResponse.json({
        pharmacies: fallback,
        total: fallback.length,
        error: 'Using nearby fallback data',
      });
    }
    
    return NextResponse.json({
      pharmacies: search ? pharmacies.filter((p: any) => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.address?.toLowerCase().includes(search.toLowerCase())
      ) : pharmacies,
      total: pharmacies.length,
    });
    
  } catch (error) {
    console.error('Pharmacy API error:', error);
    const fallback = generateFallbackPharmacies(lat, lng);
    return NextResponse.json({
      pharmacies: fallback,
      total: fallback.length,
      error: 'Using nearby fallback data',
    });
  }
}