import { NextRequest, NextResponse } from 'next/server';
import { getDistanceKm } from '@/utils/distance';

const DOCTOR_IMAGES = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1758691463582-11aea602cd4a?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1758691463384-771db2f192b3?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1758691462651-611d730c5272?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1758691463393-a2aa9900af8a?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1758691461530-b215ed4ede6a?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1666886573583-9839aafe43cf?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1666886573553-453e9cdbd967?auto=format&fit=crop&q=80&w=800',
];

function getDoctorImage(name: string): string {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return DOCTOR_IMAGES[hash % DOCTOR_IMAGES.length];
}

const SPECIALTIES = ['Cardiology','Neurology','Orthopedics','Pediatrics','Gynecology','Dermatology','Ophthalmology','Psychiatry','ENT','Dentistry','Urology','Oncology','Gastroenterology','Pulmonology','General Medicine'];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const specialty = searchParams.get('specialty') || '';
  const search = searchParams.get('q') || '';
  const radius = parseInt(searchParams.get('radius') || '15000');
  const limit = parseInt(searchParams.get('limit') || '0');

  let doctors: any[] = [];
  let source = 'fallback';

  try {
    const query = `[out:json][timeout:25];(
      node(around:${Math.min(radius, 50000)},${lat},${lng})[amenity=doctors];
      node(around:${Math.min(radius, 50000)},${lat},${lng})[healthcare~"doctor|physician|clinic"];
    );out center 30;`;

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'ZyntraCare/1.0' },
      signal: AbortSignal.timeout(25000),
    });

    source = 'overpass';
    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    const data = await res.json();
    const elements = data.elements || [];

    if (elements.length > 0) {
      doctors = elements
        .filter((el: any) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLng = el.lon ?? el.center?.lon;
          return elLat && elLng && (el.tags?.name || el.tags?.['name:en']);
        })
        .map((el: any, i: number) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLng = el.lon ?? el.center?.lon;
          const name = el.tags?.name || el.tags?.['name:en'] || 'Doctor';
          const specTag = el.tags?.healthcare || el.tags?.medical || el.tags?.specialty || '';
          const docSpecialty = SPECIALTIES.find(s => specTag.toLowerCase().includes(s.toLowerCase())) || 'General Medicine';
          return {
            id: `doc-${el.id || i}`,
            name,
            specialty: docSpecialty,
            experience: parseInt(el.tags?.experience) || Math.floor(Math.random() * 25) + 3,
            consultationFee: Math.floor(Math.random() * 1500) + 300,
            rating: 3.8 + Math.random() * 1.0,
            available: true,
            education: el.tags?.education || 'MBBS, MD',
            bio: el.tags?.description || `Experienced ${docSpecialty} specialist`,
            languages: el.tags?.languages ? el.tags.languages.split(',').map((l: string) => l.trim()) : ['English', 'Hindi'],
            distance: parseFloat(getDistanceKm(lat, lng, elLat, elLng).toFixed(2)),
            location: { lat: elLat, lng: elLng },
            address: [el.tags?.['addr:houseno'], el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', '),
            city: el.tags?.['addr:city'] || '',
            phone: el.tags?.phone || '',
            image: getDoctorImage(name),
            source: 'overpass',
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance);
    }

    if (doctors.length === 0) {
      source = 'fallback';
    }
  } catch (error) {
    console.error('Overpass fetch failed, using fallback doctors:', error);
    source = 'fallback';
  }

  if (doctors.length === 0) {
    const FALLBACK_DOCTORS = [
      { id: 'fd-1', name: 'Dr. Rajesh Kumar', specialty: 'Cardiology', experience: 15, consultationFee: 800, rating: 4.5, available: true, education: 'MBBS, MD - Cardiology', bio: 'Senior Cardiologist with 15+ years experience', languages: ['English', 'Hindi'], distance: 1.5, location: { lat: 28.62, lng: 77.21 }, city: 'Delhi', phone: '+91-9876543210', image: getDoctorImage('Dr. Rajesh Kumar') },
      { id: 'fd-2', name: 'Dr. Priya Sharma', specialty: 'Neurology', experience: 12, consultationFee: 1200, rating: 4.7, available: true, education: 'MBBS, MD - Neurology', bio: 'Expert neurologist specializing in stroke and epilepsy', languages: ['English', 'Hindi'], distance: 2.3, location: { lat: 28.63, lng: 77.22 }, city: 'Delhi', phone: '+91-9876543211', image: getDoctorImage('Dr. Priya Sharma') },
      { id: 'fd-3', name: 'Dr. Amit Verma', specialty: 'Orthopedics', experience: 18, consultationFee: 1000, rating: 4.6, available: true, education: 'MBBS, MS - Orthopedics', bio: 'Joint replacement and sports injury specialist', languages: ['English', 'Hindi'], distance: 3.1, location: { lat: 28.64, lng: 77.23 }, city: 'Delhi', phone: '+91-9876543212', image: getDoctorImage('Dr. Amit Verma') },
      { id: 'fd-4', name: 'Dr. Sunita Gupta', specialty: 'Gynecology', experience: 20, consultationFee: 700, rating: 4.8, available: true, education: 'MBBS, MD - Gynecology', bio: 'Leading gynecologist and obstetrics specialist', languages: ['English', 'Hindi'], distance: 1.8, location: { lat: 28.62, lng: 77.20 }, city: 'Delhi', phone: '+91-9876543213', image: getDoctorImage('Dr. Sunita Gupta') },
      { id: 'fd-5', name: 'Dr. Vikram Singh', specialty: 'Pediatrics', experience: 10, consultationFee: 600, rating: 4.4, available: true, education: 'MBBS, MD - Pediatrics', bio: 'Child health specialist with gentle approach', languages: ['English', 'Hindi'], distance: 2.7, location: { lat: 28.63, lng: 77.21 }, city: 'Delhi', phone: '+91-9876543214', image: getDoctorImage('Dr. Vikram Singh') },
      { id: 'fd-6', name: 'Dr. Neha Patel', specialty: 'Dermatology', experience: 8, consultationFee: 500, rating: 4.3, available: true, education: 'MBBS, MD - Dermatology', bio: 'Skin, hair and cosmetic dermatologist', languages: ['English', 'Hindi'], distance: 4.0, location: { lat: 28.65, lng: 77.24 }, city: 'Delhi', phone: '+91-9876543215', image: getDoctorImage('Dr. Neha Patel') },
      { id: 'fd-7', name: 'Dr. Arjun Reddy', specialty: 'Oncology', experience: 16, consultationFee: 1500, rating: 4.7, available: true, education: 'MBBS, DM - Oncology', bio: 'Cancer specialist with expertise in chemotherapy', languages: ['English', 'Telugu', 'Hindi'], distance: 3.5, location: { lat: 28.64, lng: 77.22 }, city: 'Delhi', phone: '+91-9876543216', image: getDoctorImage('Dr. Arjun Reddy') },
      { id: 'fd-8', name: 'Dr. Meera Iyer', specialty: 'Ophthalmology', experience: 14, consultationFee: 900, rating: 4.5, available: true, education: 'MBBS, MS - Ophthalmology', bio: 'Eye surgeon specializing in cataract and LASIK', languages: ['English', 'Tamil', 'Hindi'], distance: 2.9, location: { lat: 28.63, lng: 77.23 }, city: 'Delhi', phone: '+91-9876543217', image: getDoctorImage('Dr. Meera Iyer') },
      { id: 'fd-9', name: 'Dr. Sanjay Joshi', specialty: 'Gastroenterology', experience: 13, consultationFee: 1100, rating: 4.4, available: true, education: 'MBBS, DM - Gastroenterology', bio: 'Digestive health and liver disease specialist', languages: ['English', 'Hindi'], distance: 4.2, location: { lat: 28.66, lng: 77.25 }, city: 'Delhi', phone: '+91-9876543218', image: getDoctorImage('Dr. Sanjay Joshi') },
      { id: 'fd-10', name: 'Dr. Ananya Bose', specialty: 'Psychiatry', experience: 11, consultationFee: 1200, rating: 4.6, available: true, education: 'MBBS, MD - Psychiatry', bio: 'Mental health and wellness counselor', languages: ['English', 'Bengali', 'Hindi'], distance: 3.8, location: { lat: 28.65, lng: 77.24 }, city: 'Delhi', phone: '+91-9876543219', image: getDoctorImage('Dr. Ananya Bose') },
    ];
    doctors = FALLBACK_DOCTORS;
  }

  let filtered = doctors;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((d: any) =>
      d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.city.toLowerCase().includes(q)
    );
  }
  if (specialty) {
    filtered = filtered.filter((d: any) =>
      d.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }

  if (limit > 0) {
    filtered = filtered.slice(0, limit);
  }

  const specialties = [...new Set(doctors.map((d: any) => d.specialty))].sort() as string[];

  return NextResponse.json({
    doctors: filtered,
    total: filtered.length,
    page: 1,
    pages: 1,
    specialties,
    source,
  });
}

export async function POST(req: NextRequest) {
  try {
    const prisma = (await import('@/lib/prisma')).default;
    const body = await req.json();
    const user = await prisma.user.findUnique({ where: { email: body.email?.toLowerCase() } });
    if (!user) return NextResponse.json({ error: 'User not found. Register first.' }, { status: 400 });
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id, specialty: body.specialty, license: body.license || 'N/A',
        experience: body.experience || 0, bio: body.bio || '', education: body.education || '',
        languages: body.languages || 'English', consultingFee: body.consultingFee || 500,
        isAvailable: true,
      },
    });
    return NextResponse.json({ success: true, doctor }, { status: 201 });
  } catch (error) {
    console.error('Doctor POST error:', error);
    return NextResponse.json({ error: 'Failed to register doctor' }, { status: 500 });
  }
}
