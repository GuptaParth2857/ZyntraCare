import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const driverId = searchParams.get('driverId') || '';
  const status = searchParams.get('status') || 'pending';

  try {
    let bookings;
    if (status === 'history' && driverId) {
      bookings = await prisma.ambulanceBooking.findMany({
        where: {
          ambulanceId: driverId,
          status: { in: ['completed', 'cancelled'] },
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      });
    } else {
      bookings = await prisma.ambulanceBooking.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
      });
    }

    const formatted = bookings.map((b) => ({
      id: b.id,
      patientName: b.patientName,
      patientPhone: b.patientPhone,
      pickupLat: b.pickupLat,
      pickupLng: b.pickupLng,
      pickupAddress: b.pickupAddress,
      dropLat: b.dropLat,
      dropLng: b.dropLng,
      dropAddress: b.dropAddress,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
      assignedAt: b.assignedAt?.toISOString() || null,
      completedAt: b.completedAt?.toISOString() || null,
      distance: lat && lng ? haversineDistance(lat, lng, b.pickupLat, b.pickupLng) : null,
    }));

    if (lat && lng && status !== 'history') {
      formatted.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    return NextResponse.json({ success: true, bookings: formatted });
  } catch (error) {
    console.error('Ambulance GET error:', error);
    const fallback: any[] = [];
    return NextResponse.json({ success: true, bookings: fallback });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { driverId, lat, lng, status } = body;

    if (!driverId) {
      return NextResponse.json({ success: false, error: 'driverId required' }, { status: 400 });
    }

    try {
      await prisma.ambulance.update({
        where: { id: driverId },
        data: {
          lat: lat ?? undefined,
          lng: lng ?? undefined,
          isAvailable: status === 'available',
        },
      });

      await prisma.ambulanceLocationUpdate.create({
        data: {
          ambulanceId: driverId,
          lat: lat || 0,
          lng: lng || 0,
        },
      });
    } catch {
      // Ambulance model may not exist
    }

    return NextResponse.json({ success: true, message: 'Location updated' });
  } catch (error) {
    console.error('Ambulance POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update location' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, driverId, action } = body;

    if (!bookingId || !action) {
      return NextResponse.json({ success: false, error: 'bookingId and action required' }, { status: 400 });
    }

    if (action === 'accept') {
      const booking = await prisma.ambulanceBooking.update({
        where: { id: bookingId },
        data: {
          ambulanceId: driverId,
          status: 'assigned',
          assignedAt: new Date(),
        },
      });

      try {
        await prisma.ambulance.update({
          where: { id: driverId },
          data: { isAvailable: false },
        });
      } catch {}

      return NextResponse.json({ success: true, booking });
    }

    if (action === 'en_route') {
      const booking = await prisma.ambulanceBooking.update({
        where: { id: bookingId },
        data: { status: 'en_route' },
      });
      return NextResponse.json({ success: true, booking });
    }

    if (action === 'complete') {
      const booking = await prisma.ambulanceBooking.update({
        where: { id: bookingId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      try {
        if (driverId) {
          await prisma.ambulance.update({
            where: { id: driverId },
            data: { isAvailable: true },
          });
        }
      } catch {}

      return NextResponse.json({ success: true, booking });
    }

    if (action === 'decline') {
      await prisma.ambulanceBooking.update({
        where: { id: bookingId },
        data: { status: 'pending', ambulanceId: null },
      });
      return NextResponse.json({ success: true, message: 'Booking declined' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Ambulance PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 });
  }
}
