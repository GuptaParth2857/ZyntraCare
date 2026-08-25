import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDistanceKm } from '@/utils/distance';

const NEARBY_STATES: Record<string, string[]> = {
  'Andhra Pradesh': ['Telangana', 'Tamil Nadu', 'Karnataka', 'Odisha'],
  'Arunachal Pradesh': ['Assam', 'Nagaland'],
  'Assam': ['Arunachal Pradesh', 'Nagaland', 'Meghalaya', 'West Bengal', 'Manipur', 'Mizoram', 'Tripura'],
  'Bihar': ['Uttar Pradesh', 'Jharkhand', 'West Bengal'],
  'Chhattisgarh': ['Madhya Pradesh', 'Maharashtra', 'Odisha', 'Telangana', 'Jharkhand'],
  'Goa': ['Maharashtra', 'Karnataka'],
  'Gujarat': ['Rajasthan', 'Madhya Pradesh', 'Maharashtra'],
  'Haryana': ['Punjab', 'Rajasthan', 'Uttar Pradesh', 'Delhi'],
  'Himachal Pradesh': ['Punjab', 'Haryana', 'Uttarakhand'],
  'Jharkhand': ['Bihar', 'West Bengal', 'Odisha', 'Chhattisgarh'],
  'Karnataka': ['Maharashtra', 'Goa', 'Andhra Pradesh', 'Tamil Nadu', 'Telangana', 'Kerala'],
  'Kerala': ['Karnataka', 'Tamil Nadu'],
  'Madhya Pradesh': ['Rajasthan', 'Gujarat', 'Maharashtra', 'Chhattisgarh', 'Uttar Pradesh'],
  'Maharashtra': ['Gujarat', 'Madhya Pradesh', 'Chhattisgarh', 'Telangana', 'Karnataka', 'Goa'],
  'Manipur': ['Assam', 'Nagaland', 'Mizoram'],
  'Meghalaya': ['Assam'],
  'Mizoram': ['Assam', 'Manipur', 'Tripura'],
  'Nagaland': ['Assam', 'Manipur', 'Arunachal Pradesh'],
  'Odisha': ['West Bengal', 'Jharkhand', 'Chhattisgarh', 'Andhra Pradesh'],
  'Punjab': ['Haryana', 'Himachal Pradesh', 'Rajasthan', 'Delhi'],
  'Rajasthan': ['Punjab', 'Haryana', 'Gujarat', 'Madhya Pradesh', 'Uttar Pradesh', 'Delhi'],
  'Sikkim': ['West Bengal'],
  'Tamil Nadu': ['Andhra Pradesh', 'Karnataka', 'Kerala'],
  'Telangana': ['Andhra Pradesh', 'Chhattisgarh', 'Maharashtra', 'Karnataka'],
  'Tripura': ['Assam', 'Mizoram'],
  'Uttar Pradesh': ['Rajasthan', 'Haryana', 'Delhi', 'Madhya Pradesh', 'Bihar', 'Uttarakhand'],
  'Uttarakhand': ['Himachal Pradesh', 'Uttar Pradesh'],
  'West Bengal': ['Sikkim', 'Assam', 'Jharkhand', 'Odisha', 'Bihar'],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state');
  const includeNearby = searchParams.get('includeNearby') !== 'false';
  const specialty = searchParams.get('specialty');
  const isAvailable = searchParams.get('available');
  const search = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const lat = parseFloat(searchParams.get('lat') || 'NaN');
  const lng = parseFloat(searchParams.get('lng') || 'NaN');
  const hasLocation = !isNaN(lat) && !isNaN(lng);

  try {
    const statesToSearch = new Set<string>();

    if (state && state !== 'All India') {
      statesToSearch.add(state);
      if (includeNearby && NEARBY_STATES[state]) {
        NEARBY_STATES[state].forEach(s => statesToSearch.add(s));
      }
    }

    const whereDoctor: any = {};
    if (specialty) whereDoctor.specialty = { contains: specialty };
    if (isAvailable === 'true') whereDoctor.isAvailable = true;

    const whereHospital: any = {};
    if (statesToSearch.size > 0) {
      whereHospital.state = { in: Array.from(statesToSearch) };
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where: {
          ...whereDoctor,
          hospitalLinks: statesToSearch.size > 0 ? {
            some: { hospital: whereHospital },
          } : undefined,
        },
        include: {
          user: { select: { name: true, email: true, phone: true, city: true } },
          hospitalLinks: {
            include: {
              hospital: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  state: true,
                  pincode: true,
                  phone: true,
                  email: true,
                  website: true,
                  lat: true,
                  lng: true,
                  rating: true,
                  workingHours: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { experience: 'desc' },
      }),
      prisma.doctor.count({
        where: {
          ...whereDoctor,
          hospitalLinks: statesToSearch.size > 0 ? {
            some: { hospital: whereHospital },
          } : undefined,
        },
      }),
    ]);

    const specialties = await prisma.doctor.findMany({
      select: { specialty: true },
      distinct: ['specialty'],
    });

    const formattedDoctors = doctors.map(d => {
      const hospitalLoc = d.hospitalLinks[0]?.hospital;
      let distance: number | null = null;
      if (hasLocation && hospitalLoc?.lat != null && hospitalLoc?.lng != null) {
        distance = parseFloat(getDistanceKm(lat, lng, hospitalLoc.lat, hospitalLoc.lng).toFixed(1));
      }

      return {
        id: d.id,
        name: d.user.name || 'Doctor',
        specialty: d.specialty,
        experience: d.experience,
        consultationFee: d.consultingFee,
        rating: Math.min(5, Math.max(3, 3.5 + d.experience * 0.02)),
        available: d.isAvailable,
        education: d.education,
        bio: d.bio,
        languages: d.languages ? d.languages.split(',').map(l => l.trim()) : ['English'],
        distance,
        hospitals: d.hospitalLinks.map(link => ({
          id: link.hospital.id,
          name: link.hospital.name,
          address: link.hospital.address,
          city: link.hospital.city,
          state: link.hospital.state,
          pincode: link.hospital.pincode,
          phone: link.hospital.phone,
          email: link.hospital.email,
          website: link.hospital.website,
          location: { lat: link.hospital.lat, lng: link.hospital.lng },
          rating: link.hospital.rating,
          workingHours: link.hospital.workingHours,
        })),
        userEmail: d.user.email,
        userPhone: d.user.phone,
        city: d.user.city,
      };
    });

    return NextResponse.json({
      doctors: formattedDoctors,
      total,
      page,
      pages: Math.ceil(total / limit),
      states: Array.from(statesToSearch),
      specialties: specialties.map(s => s.specialty),
    });
  } catch (error) {
    console.error('Specialists API error:', error);
    return NextResponse.json({ error: 'Failed to fetch specialists' }, { status: 500 });
  }
}
