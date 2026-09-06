import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateETA(distanceKm: number, urgencyLevel: string): string {
  const avgSpeedKmh = urgencyLevel === 'critical' ? 40 : urgencyLevel === 'high' ? 30 : 25;
  const minutes = Math.ceil((distanceKm / avgSpeedKmh) * 60);
  return `${Math.max(3, Math.min(minutes, 45))} min`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userLat = parseFloat(searchParams.get('lat') || '0');
    const userLng = parseFloat(searchParams.get('lng') || '0');

    const [alerts, ambulances] = await Promise.all([
      prisma.emergencyAlert.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { name: true, phone: true } },
        },
      }),
      prisma.ambulance.findMany({
        where: { isAvailable: true },
        select: { id: true, driverName: true, vehicleNumber: true, lat: true, lng: true },
      }),
    ]);

    const cases = alerts.map((alert, idx) => {
      let eta = '8 min';
      let assignedUnit = 'AMB-' + String(idx + 1).padStart(3, '0');

      if (ambulances.length > 0 && alert.latitude && alert.longitude) {
        const nearest = ambulances.reduce((best, amb) => {
          if (!amb.lat || !amb.lng) return best;
          const dist = haversineDistance(alert.latitude!, alert.longitude!, amb.lat, amb.lng);
          const bestDist = best.dist;
          return dist < bestDist ? { dist, amb } : best;
        }, { dist: Infinity, amb: ambulances[0] });

        if (nearest.amb.lat && nearest.amb.lng) {
          const dist = haversineDistance(alert.latitude!, alert.longitude!, nearest.amb.lat, nearest.amb.lng);
          eta = estimateETA(dist, alert.status || 'medium');
          assignedUnit = nearest.amb.vehicleNumber || assignedUnit;
        }
      } else if (userLat && userLng && alert.latitude && alert.longitude) {
        const dist = haversineDistance(userLat, userLng, alert.latitude!, alert.longitude!);
        eta = estimateETA(dist, alert.status || 'medium');
      }

      return {
        id: `EM-${1000 + idx}`,
        type: alert.alertType || 'Emergency',
        patient: alert.user?.name || alert.description?.split(',')[0] || 'Unknown',
        priority: alert.status === 'critical' ? 'Critical' : alert.status === 'high' ? 'High' : 'Medium',
        eta,
        location: alert.location,
        unit: assignedUnit,
        timestamp: alert.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ cases });
  } catch (error) {
    console.error('Emergency cases error:', error);
    return NextResponse.json({ cases: [] }, { status: 500 });
  }
}
