import { NextRequest, NextResponse } from 'next/server';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const FALLBACK_LABS = [
  { id: '1', name: 'Dr. Lal PathLabs', address: 'Connaught Place', city: 'Delhi', phone: '+91-11-12345678', location: { lat: 28.6142, lng: 77.2091 }, tests: ['Blood Test', 'CBC', 'Thyroid', 'Diabetes'], homeCollection: true, reportsIn: '6 hours', rating: '4.8' },
  { id: '2', name: 'Metropolis Lab', address: 'Janpath', city: 'Delhi', phone: '+91-11-45678901', location: { lat: 28.6125, lng: 77.2120 }, tests: ['Thyroid', 'Diabetes', 'Liver Function', 'Kidney Function'], homeCollection: false, reportsIn: '5 hours', rating: '4.9' },
  { id: '3', name: 'SRL Diagnostics', address: 'Barakhamba Road', city: 'Delhi', phone: '+91-11-23456789', location: { lat: 28.6305, lng: 77.2195 }, tests: ['Blood Test', 'Urine Test', 'COVID Test', 'Dengue'], homeCollection: true, reportsIn: '4 hours', rating: '4.7' },
  { id: '4', name: 'Fortis Lab', address: 'Nehru Place', city: 'Delhi', phone: '+91-11-98765432', location: { lat: 28.5505, lng: 77.2525 }, tests: ['MRI', 'CT Scan', 'X-Ray', 'Blood Test'], homeCollection: true, reportsIn: '8 hours', rating: '4.6' },
  { id: '5', name: 'Max Lab', address: 'Saket', city: 'Delhi', phone: '+91-11-34567890', location: { lat: 28.5244, lng: 77.2067 }, tests: ['MRI', 'CT Scan', 'ECG', 'Blood Test'], homeCollection: true, reportsIn: '10 hours', rating: '4.4' },
  { id: '6', name: 'Apollo Diagnostics', address: 'Lajpat Nagar', city: 'Delhi', phone: '+91-11-23456780', location: { lat: 28.5677, lng: 77.2433 }, tests: ['CBC', 'Lipid Profile', 'Diabetes', 'Thyroid'], homeCollection: false, reportsIn: '12 hours', rating: '4.5' },
];

function generateFallbackLabs(lat: number, lng: number) {
  const generateNearbyCoords = (baseLat: number, baseLng: number, offset: number) => ({
    lat: baseLat + (Math.random() - 0.5) * offset * 0.01,
    lng: baseLng + (Math.random() - 0.5) * offset * 0.01,
  });

  const LAB_TESTS = ['Blood Test', 'CBC', 'Lipid Profile', 'Thyroid', 'Diabetes', 'Liver Function', 'Kidney Function', 'ECG', 'X-Ray', 'MRI', 'CT Scan'];

  const locations = [
    { name: 'Dr. Lal PathLabs', address: 'Main Road', offset: 1.5 },
    { name: 'Metropolis Lab', address: 'Market Complex', offset: 2.0 },
    { name: 'SRL Diagnostics', address: 'Near Metro Station', offset: 2.5 },
    { name: 'Apollo Diagnostics', address: 'Sector Road', offset: 3.0 },
    { name: 'Max Lab', address: 'Commercial Area', offset: 3.5 },
    { name: 'Fortis Lab', address: 'Local Market', offset: 4.0 },
  ];

  return locations.map((loc, i) => {
    const coords = generateNearbyCoords(lat, lng, loc.offset);
    const numTests = 4 + Math.floor(Math.random() * 4);
    return {
      id: `lab_${i + 1}`,
      name: loc.name,
      address: loc.address,
      city: 'Nearby',
      phone: `+91-${1000000000 + i}`,
      location: coords,
      distance: calculateDistance(lat, lng, coords.lat, coords.lng),
      tests: LAB_TESTS.slice(0, numTests),
      homeCollection: i % 2 === 0,
      reportsIn: `${4 + Math.floor(Math.random() * 8)} hours`,
      rating: (4 + Math.random()).toFixed(1),
    };
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const test = searchParams.get('test') || '';
  
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["healthcare"="laboratory"](around:30000,${lat},${lng});
      way["healthcare"="laboratory"](around:30000,${lat},${lng});
      node["amenity"="clinic"](around:30000,${lat},${lng});
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
    
    const LAB_TESTS = [
      'Blood Test', 'CBC', 'Lipid Profile', 'Thyroid', 'Diabetes', 'Liver Function',
      'Kidney Function', 'ECG', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound',
      'COVID Test', 'Dengue', 'Malaria', 'HIV Test', 'Pregnancy Test', 'Urine Test'
    ];
    
    const labs = (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => {
        const lLat = el.lat ?? el.center?.lat;
        const lLng = el.lon ?? el.center?.lon;
        const numTests = Math.floor(Math.random() * 8) + 4;
        const availableTests = LAB_TESTS.sort(() => Math.random() - 0.5).slice(0, numTests);
        
        return {
          id: `lab_${el.id}`,
          name: el.tags.name,
          address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', '),
          city: el.tags['addr:city'] || 'Nearby',
          phone: el.tags.phone || el.tags['contact:phone'] || '',
          location: { lat: lLat, lng: lLng },
          distance: calculateDistance(lat, lng, lLat, lLng),
          tests: availableTests,
          homeCollection: Math.random() > 0.5,
          reportsIn: Math.floor(Math.random() * 12) + 4 + ' hours',
          rating: (3.5 + Math.random() * 1.5).toFixed(1),
        };
      })
      .sort((a: any, b: any) => a.distance - b.distance);
    
    if (labs.length === 0) {
      const fallback = generateFallbackLabs(lat, lng);
      return NextResponse.json({
        labs: test ? fallback.filter((l: any) => 
          l.tests.some((t: string) => t.toLowerCase().includes(test.toLowerCase()))
        ) : fallback,
        total: fallback.length,
        availableTests: LAB_TESTS,
        error: 'Using nearby fallback data',
      });
    }
    
    return NextResponse.json({
      labs: test ? labs.filter((l: any) => 
        l.tests.some((t: string) => t.toLowerCase().includes(test.toLowerCase()))
      ) : labs,
      total: labs.length,
      availableTests: LAB_TESTS,
    });
    
  } catch (error) {
    console.error('Labs API error:', error);
    const fallback = generateFallbackLabs(lat, lng);
    return NextResponse.json({
      labs: test ? fallback.filter((l: any) => 
        l.tests.some((t: string) => t.toLowerCase().includes(test.toLowerCase()))
      ) : fallback,
      total: fallback.length,
      availableTests: [],
      error: 'Using nearby fallback data',
    });
  }
}