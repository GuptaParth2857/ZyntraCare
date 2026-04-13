import { NextResponse } from 'next/server';
import { hospitals } from '@/data/mockData';

export async function POST(req: Request) {
  const { lat, lng, priority = 'medium' } = await req.json();
  const scored = hospitals.map(h => {
    const distance = calculateDistance(lat, lng, h.location.lat, h.location.lng);
    const bedScore = h.beds.available / h.beds.total;
    const emergency = h.emergency ? 1 : 0;
    const score = (1 / (distance + 1)) * 0.5 + bedScore * 0.3 + emergency * 0.2;
    return { ...h, distance, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return NextResponse.json(scored.slice(0, 5));
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}