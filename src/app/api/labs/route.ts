import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const LAB_TESTS = ['Blood Test', 'CBC', 'Lipid Profile', 'Thyroid', 'Diabetes', 'Liver Function', 'Kidney Function', 'ECG', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'COVID Test'];

const FALLBACK_LABS = [
  { name: 'Dr. Lal PathLabs', address: 'Connaught Place, Delhi', lat: 28.6142, lng: 77.2091 },
  { name: 'Metropolis Lab', address: 'Janpath, Delhi', lat: 28.6125, lng: 77.2120 },
  { name: 'SRL Diagnostics', address: 'Barakhamba Road, Delhi', lat: 28.6305, lng: 77.2195 },
  { name: 'Apollo Diagnostics', address: 'Nehru Place, Delhi', lat: 28.5505, lng: 77.2525 },
  { name: 'Max Lab', address: 'Saket, Delhi', lat: 28.5244, lng: 77.2067 },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const test = searchParams.get('test') || '';
  
  try {
    const dbLabs = await prisma.hospital.findMany({
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

    if (dbLabs.length > 0) {
      const formatted = dbLabs.map(p => ({
        id: p.id,
        name: p.name,
        address: p.address,
        city: p.city,
        phone: p.phone,
        location: { lat: p.lat, lng: p.lng },
        distance: calculateDistance(lat, lng, p.lat, p.lng),
        tests: LAB_TESTS.slice(0, 4 + Math.floor(Math.random() * 8)),
        homeCollection: Math.random() > 0.5,
        reportsIn: `${4 + Math.floor(Math.random() * 8)} hours`,
        rating: p.rating || (4 + Math.random()).toFixed(1),
      })).sort((a: any, b: any) => a.distance - b.distance);

      return NextResponse.json({
        labs: test 
          ? formatted.filter((l: any) => l.tests.some((t: string) => t.toLowerCase().includes(test.toLowerCase())))
          : formatted,
        total: formatted.length,
        availableTests: LAB_TESTS,
        source: 'database',
      });
    }

    const fallback = FALLBACK_LABS.map((p, i) => ({
      id: `fallback_${i}`,
      name: p.name,
      address: p.address,
      city: p.address.split(', ')[1] || 'Nearby',
      phone: '+919999999999',
      location: { lat: p.lat, lng: p.lng },
      distance: calculateDistance(lat, lng, p.lat, p.lng),
      tests: LAB_TESTS.slice(0, 4 + Math.floor(Math.random() * 4)),
      homeCollection: i % 2 === 0,
      reportsIn: `${4 + Math.floor(Math.random() * 8)} hours`,
      rating: (4 + Math.random()).toFixed(1),
    })).sort((a: any, b: any) => a.distance - b.distance);

    return NextResponse.json({
      labs: test 
        ? fallback.filter((l: any) => l.tests.some((t: string) => t.toLowerCase().includes(test.toLowerCase())))
        : fallback,
      total: fallback.length,
      availableTests: LAB_TESTS,
      source: 'fallback',
    });
  } catch (error) {
    console.warn('Labs API unavailable, using fallback data:', (error as Error)?.message);
    const fallback = FALLBACK_LABS.map((p, i) => ({
      id: `fallback_${i}`,
      name: p.name,
      address: p.address,
      city: p.address.split(', ')[1] || 'Nearby',
      phone: '+919999999999',
      location: { lat: p.lat, lng: p.lng },
      distance: calculateDistance(lat, lng, p.lat, p.lng),
      tests: LAB_TESTS.slice(0, 4 + Math.floor(Math.random() * 4)),
      homeCollection: i % 2 === 0,
      reportsIn: `${4 + Math.floor(Math.random() * 8)} hours`,
      rating: (4 + Math.random()).toFixed(1),
    }));
    return NextResponse.json({ labs: fallback, total: fallback.length, availableTests: LAB_TESTS, source: 'fallback' });
  }
}