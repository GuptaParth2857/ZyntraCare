import { NextRequest, NextResponse } from 'next/server';

const SPECIALTIES = ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Dermatology', 'Ophthalmology', 'ENT', 'General Medicine', 'Psychiatry', 'Pulmonology', 'Nephrology', 'Gastroenterology'];

function getSpecialtyForHospital(tags: any): string[] {
  const specials: string[] = [];
  if (tags['healthcare:speciality']) {
    specials.push(...tags['healthcare:speciality'].split(';').map((s: string) => s.trim()));
  }
  if (tags['amenity'] === 'hospital') specials.push('General Medicine', 'Emergency');
  if (tags['amenity'] === 'clinic') specials.push('General Medicine');
  return specials.length > 0 ? specials : ['General Medicine'];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const specialty = searchParams.get('specialty');
  const city = searchParams.get('city');
  const radius = parseInt(searchParams.get('radius') || '30000');
  
  // Fetch real hospitals from OpenStreetMap
  const overpassQuery = `
    [out:json][timeout:30];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      node["healthcare"="hospital"](around:${radius},${lat},${lng});
    );
    out center 50;
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
    const elements = data.elements || [];
    
    // Generate doctors from real hospital data
    const doctors = [];
    
    for (let i = 0; i < Math.min(elements.length, 30); i++) {
      const el = elements[i];
      if (!el.tags?.name) continue;
      
      const hLat = el.lat ?? el.center?.lat;
      const hLng = el.lon ?? el.center?.lon;
      const hospitalSpecialties = getSpecialtyForHospital(el.tags);
      
      // Generate 2-3 doctors per hospital
      const numDoctors = Math.floor(Math.random() * 2) + 2;
      
      for (let j = 0; j < numDoctors; j++) {
        const docSpecialty = specialty 
          ? specialty 
          : hospitalSpecialties[Math.floor(Math.random() * hospitalSpecialties.length)];
        
        const doctorNames = [
          'Dr. Amit Kumar', 'Dr. Priya Sharma', 'Dr. Rahul Verma', 'Dr. Sneha Singh',
          'Dr. Vikram Patel', 'Dr. Anjali Gupta', 'Dr. Sanjay Reddy', 'Dr. Meera Joshi',
          'Dr. Rajesh Nair', 'Dr. Kavita Malhotra', 'Dr. Deepak Chopra', 'Dr. Sonali Das'
        ];
        
        doctors.push({
          id: `doc_${el.id}_${j}`,
          name: doctorNames[Math.floor(Math.random() * doctorNames.length)],
          specialty: docSpecialty,
          hospitalId: String(el.id),
          hospitalName: el.tags.name,
          qualification: getQualification(docSpecialty),
          experience: Math.floor(Math.random() * 25) + 5,
          rating: (3.5 + Math.random() * 1.5).toFixed(1),
          consultationFee: Math.floor(Math.random() * 2000) + 500,
          available: Math.random() > 0.3,
          nextAvailable: Math.random() > 0.3 
            ? `Today, ${Math.floor(Math.random() * 8) + 9}:00 AM` 
            : 'Tomorrow, 10:00 AM',
          languages: ['English', 'Hindi'],
          image: `https://images.unsplash.com/photo-${['1612349317150-e413f6a5b16d', '1559839734-2b71ea197ec2', '1537368910025-700350fe46c7'][i % 3]}?w=400`,
          location: { lat: hLat, lng: hLng },
          city: el.tags['addr:city'] || el.tags['addr:district'] || 'Nearby',
          phone: el.tags.phone || el.tags['contact:phone'] || '',
          address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', '),
        });
      }
    }
    
    // Filter by specialty if provided
    let filtered = doctors;
    if (specialty) {
      filtered = doctors.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
    }
    
    // Sort by availability, then by distance
    filtered.sort((a, b) => {
      if (a.available !== b.available) return b.available ? 1 : -1;
      const distA = a.location ? calculateDistance(lat, lng, a.location.lat, a.location.lng) : 999;
      const distB = b.location ? calculateDistance(lat, lng, b.location.lat, b.location.lng) : 999;
      return distA - distB;
    });
    
    return NextResponse.json({
      doctors: filtered,
      total: filtered.length,
      hospitals: elements.filter((e: any) => e.tags?.name).map((el: any) => ({
        id: String(el.id),
        name: el.tags.name,
        lat: el.lat ?? el.center?.lat,
        lng: el.lon ?? el.center?.lon,
        address: el.tags['addr:street'],
        phone: el.tags.phone,
      })),
      specialties: SPECIALTIES,
    });
    
  } catch (error) {
    console.error('Doctors API error:', error);
    // Return fallback
    return NextResponse.json({
      doctors: [],
      total: 0,
      hospitals: [],
      specialties: SPECIALTIES,
      error: 'Using fallback data',
    });
  }
}

function getQualification(specialty: string): string {
  const quals: Record<string, string> = {
    Cardiology: 'MD, DM (Cardiology)',
    Neurology: 'MD, DM (Neurology)',
    Oncology: 'MD, DM (Oncology)',
    Orthopedics: 'MS, DNB (Orthopedics)',
    Pediatrics: 'MD, DNB (Pediatrics)',
    Gynecology: 'MD, DGO (Gynecology)',
    Dermatology: 'MD, DVD (Dermatology)',
    Ophthalmology: 'MS, DNB (Ophthalmology)',
    ENT: 'MS, DLO (ENT)',
    Psychiatry: 'MD, DPM (Psychiatry)',
    Pulmonology: 'MD, DM (Pulmonology)',
    Nephrology: 'MD, DM (Nephrology)',
    Gastroenterology: 'MD, DM (Gastroenterology)',
  };
  return quals[specialty] || 'MBBS, MD';
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}