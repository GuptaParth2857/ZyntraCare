import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

async function requireAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: false });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const now = new Date();
  const last24h = new Date(now.getTime() - DAY_MS);

  try {
    const [
      users, hospitals, doctors, labs, pharmacies, appointments,
      emergencyAlerts, healthRecords, subscriptions, feedback, contacts,
      sponsors, camps, organDonors, organRecipients, transactions,
      rewards, drones, ambulances, clinics, onlineNow, bedsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.hospital.count(),
      prisma.doctor.count(),
      prisma.lab.count(),
      prisma.pharmacy.count(),
      prisma.appointment.count(),
      prisma.emergencyAlert.count(),
      prisma.healthRecord.count(),
      prisma.subscription.count(),
      prisma.feedback.count(),
      prisma.contactMessage.count(),
      prisma.sponsorInquiry.count(),
      prisma.healthCamp.count(),
      prisma.organDonor.count(),
      prisma.organRecipient.count(),
      prisma.healthTransaction.count(),
      prisma.reward.count(),
      prisma.drone.count(),
      prisma.ambulance.count(),
      prisma.healthCamp.count({ where: { campType: 'clinic' } }),
      prisma.userSession.count({ where: { expiresAt: { gt: now } } }),
      prisma.hospitalBed.count(),
    ]);

    const [users24, hospitals24, doctors24, labs24, pharmacies24, appointments24, emergencies24, healthRecords24, feedback24, transactions24, rewards24, drones24] =
      await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: last24h } } }),
        prisma.hospital.count({ where: { createdAt: { gte: last24h } } }),
        prisma.doctor.count({ where: { createdAt: { gte: last24h } } }),
        prisma.lab.count({ where: { createdAt: { gte: last24h } } }),
        prisma.pharmacy.count({ where: { createdAt: { gte: last24h } } }),
        prisma.appointment.count({ where: { createdAt: { gte: last24h } } }),
        prisma.emergencyAlert.count({ where: { createdAt: { gte: last24h } } }),
        prisma.healthRecord.count({ where: { createdAt: { gte: last24h } } }),
        prisma.feedback.count({ where: { createdAt: { gte: last24h } } }),
        prisma.healthTransaction.count({ where: { createdAt: { gte: last24h } } }),
        prisma.reward.count({ where: { createdAt: { gte: last24h } } }),
        prisma.drone.count({ where: { createdAt: { gte: last24h } } }),
      ]);

    const trend: { label: string; users: number; appointments: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);
      const end = new Date(start.getTime() + DAY_MS);
      const [u, a] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: start, lt: end } } }),
        prisma.appointment.count({ where: { createdAt: { gte: start, lt: end } } }),
      ]);
      trend.push({
        label: start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        users: u,
        appointments: a,
      });
    }

    const recentAlerts = await prisma.emergencyAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, location: true, latitude: true, longitude: true, alertType: true, status: true, createdAt: true },
    });

    const [recentUsers, recentAppointments, recentFeedback] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { name: true, email: true, createdAt: true },
      }),
      prisma.appointment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { doctorName: true, specialty: true, status: true, createdAt: true },
      }),
      prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { name: true, rating: true, category: true, createdAt: true },
      }),
    ]);

    const recent: { type: string; message: string; time: string }[] = [];
    recentUsers.forEach(u => recent.push({ type: 'user', message: `${u.name || 'New user'} (${u.email || 'no email'}) registered on ZyntraCare`, time: u.createdAt.toISOString() }));
    recentAppointments.forEach(a => recent.push({ type: 'appointment', message: `Appointment with Dr. ${a.doctorName || 'Unknown'} (${a.specialty}) — ${a.status}`, time: a.createdAt.toISOString() }));
    recentFeedback.forEach(f => recent.push({ type: 'feedback', message: `${f.name || 'Anonymous'} rated ${f.rating}/5 — ${f.category}`, time: f.createdAt.toISOString() }));
    recent.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    const cityGroups = await prisma.hospital.groupBy({
      by: ['city'],
      _count: { _all: true },
      _min: { lat: true, lng: true },
    });
    const cities = cityGroups
      .filter(c => c.city && c.city.trim().length > 0)
      .map(c => ({
        name: c.city,
        lat: c._min.lat ?? 20.5937,
        lng: c._min.lng ?? 78.9629,
        size: Math.min(Math.max((c._count._all || 1) / 8, 0.6), 3.2),
        hospitals: c._count._all,
      }));

    let bedSummary = { total: 0, available: 0, occupied: 0, occupancy: 0, icu: 0, availableIcu: 0, icuOccupancy: 0 };
    try {
      const hospitalBedProfiles = await prisma.hospital.findMany({ select: { beds: true } });
      let total = 0;
      let available = 0;
      let icu = 0;
      let availableIcu = 0;
      for (const h of hospitalBedProfiles) {
        const parsed = JSON.parse(h.beds || '{}');
        total += parsed.total || 0;
        available += parsed.available ?? 0;
        icu += parsed.icu || 0;
        availableIcu += parsed.icuAvailable ?? 0;
      }
      const occupied = Math.max(total - available, 0);
      const occupiedIcu = Math.max(icu - availableIcu, 0);
      bedSummary = {
        total,
        available,
        occupied,
        occupancy: total ? Math.round((occupied / total) * 100) : 0,
        icu,
        availableIcu,
        icuOccupancy: icu ? Math.round((occupiedIcu / icu) * 100) : 0,
      };
    } catch {
      // non-fatal: fall back to defaults
    }

    const [confirmedAppointments, availableDoctors, verifiedHospitals, respondedAlerts] = await Promise.all([
      prisma.appointment.count({ where: { status: 'confirmed' } }),
      prisma.doctor.count({ where: { isAvailable: true } }),
      prisma.hospital.count({ where: { verified: true } }),
      prisma.emergencyAlert.count({ where: { status: { not: 'TRIGGERED' } } }),
    ]);

    const pct = (numerator: number, denominator: number) =>
      denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;

    return NextResponse.json({
      counts: {
        users, hospitals, doctors, labs, pharmacies, appointments,
        emergencyAlerts, healthRecords, subscriptions, feedback, contacts,
        sponsors, camps, organDonors, organRecipients, transactions,
        rewards, drones, ambulances, clinics, onlineNow, beds: bedsCount,
      },
      today: {
        users: users24, hospitals: hospitals24, doctors: doctors24, labs: labs24,
        pharmacies: pharmacies24, appointments: appointments24, emergencyAlerts: emergencies24,
        healthRecords: healthRecords24, feedback: feedback24, transactions: transactions24,
        rewards: rewards24, drones: drones24,
      },
      trend,
      recent,
      emergencyAlerts: recentAlerts.map(a => ({
        id: a.id,
        location: a.location,
        latitude: a.latitude,
        longitude: a.longitude,
        alertType: a.alertType,
        status: a.status,
        time: a.createdAt.toISOString(),
      })),
      cities,
      bedSummary,
      rates: {
        appointmentConfirmation: pct(confirmedAppointments, appointments),
        doctorAvailability: pct(availableDoctors, doctors),
        verifiedHospitals: pct(verifiedHospitals, hospitals),
        alertResolution: pct(respondedAlerts, emergencyAlerts),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin overview API error:', error);
    return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 });
  }
}