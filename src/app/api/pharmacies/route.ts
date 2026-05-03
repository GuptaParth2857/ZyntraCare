import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const FALLBACK_PHARMACIES = [
  { name: 'Apollo Pharmacy', address: 'Main Road, Delhi', lat: 28.6145, lng: 77.2088 },
  { name: 'Medplus', address: 'Market Complex, Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Fortuna Pharmacy', address: 'City Center, Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Health First', address: 'Near Metro, Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Life Care Pharmacy', address: 'Sector Road, Kolkata', lat: 22.5726, lng: 88.3639 },
];

async function fetchFromOverpass(lat: number, lng: number) {
  const query = `[out:json][timeout:25];
    (node["amenity"="pharmacy"](around:30000,${lat},${lng});
     way["amenity"="pharmacy"](around:30000,${lat},${lng});
    );
    out center 30;`;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: `osm_${el.id}`,
        name: el.tags.name,
        address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', '),
        city: el.tags['addr:city'] || 'Nearby',
        phone: el.tags.phone || '',
        location: { lat: el.lat ?? el.center?.lat, lng: el.lon ?? el.center?.lon },
        distance: calculateDistance(lat, lng, el.lat ?? el.center?.lat, el.lon ?? el.center?.lon),
        open24x7: el.tags['opening_hours'] === '24/7',
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
      }))
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 20);
  } catch (error) {
    console.error('Overpass API error:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const search = searchParams.get('search') || '';
  
  try {
    const dbPharmacies = await prisma.hospital.findMany({
      where: { 
        emergency: false,
        doctors: 0,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        phone: true,
        lat: true,
        lng: true,
        rating: true,
      },
    });

    if (dbPharmacies.length > 0) {
      const formatted = dbPharmacies.map(p => ({
        id: p.id,
        name: p.name,
        address: p.address,
        city: p.city,
        phone: p.phone,
        location: { lat: p.lat, lng: p.lng },
        distance: calculateDistance(lat, lng, p.lat, p.lng),
        open24x7: false,
        rating: p.rating,
      })).sort((a: any, b: any) => a.distance - b.distance);

      return NextResponse.json({
        pharmacies: search 
          ? formatted.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))
          : formatted,
        total: formatted.length,
        source: 'database',
      });
    }

    const osmPharmacies = await fetchFromOverpass(lat, lng);
    
    if (osmPharmacies && osmPharmacies.length > 0) {
      return NextResponse.json({
        pharmacies: osmPharmacies,
        total: osmPharmacies.length,
        source: 'osm',
      });
    }

    const fallback = FALLBACK_PHARMACIES.map((p, i) => ({
      id: `fallback_${i}`,
      name: p.name,
      address: p.address,
      city: p.address.split(', ')[1] || 'Nearby',
      phone: '+919999999999',
      location: { lat: p.lat, lng: p.lng },
      distance: calculateDistance(lat, lng, p.lat, p.lng),
      open24x7: i < 2,
      rating: (4 + Math.random()).toFixed(1),
    }));

    return NextResponse.json({
      pharmacies: fallback,
      total: fallback.length,
      source: 'fallback',
    });
  } catch (error) {
    console.error('Pharmacy API error:', error);
    const fallback = FALLBACK_PHARMACIES.map((p, i) => ({
      id: `fallback_${i}`,
      name: p.name,
      address: p.address,
      phone: '+919999999999',
      location: { lat: p.lat, lng: p.lng },
      distance: calculateDistance(lat, lng, p.lat, p.lng),
      rating: (4 + Math.random()).toFixed(1),
    }));
    return NextResponse.json({ pharmacies: fallback, total: fallback.length, source: 'fallback' });
  }
}