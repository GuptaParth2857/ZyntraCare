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

const TABLE_CONFIG: Record<string, { model: any; orderBy?: string; select?: any }> = {
  users: {
    model: prisma.user,
    orderBy: 'createdAt',
    select: { id: true, name: true, email: true, role: true, phone: true, bloodGroup: true, city: true, createdAt: true },
  },
  feedback: {
    model: prisma.feedback,
    orderBy: 'createdAt',
    select: { id: true, name: true, email: true, rating: true, category: true, message: true, createdAt: true },
  },
  contact: {
    model: prisma.contactMessage,
    orderBy: 'createdAt',
    select: { id: true, name: true, email: true, subject: true, message: true, createdAt: true },
  },
  appointments: {
    model: prisma.appointment,
    orderBy: 'createdAt',
    select: { id: true, userId: true, doctorName: true, specialty: true, date: true, time: true, status: true, createdAt: true },
  },
  hospitals: {
    model: prisma.hospital,
    orderBy: 'createdAt',
    select: { id: true, name: true, city: true, state: true, phone: true, rating: true, verified: true, createdAt: true },
  },
  doctors: {
    model: prisma.doctor,
    orderBy: 'createdAt',
    select: { id: true, specialty: true, isAvailable: true, consultingFee: true, userId: true },
  },
  sponsors: {
    model: prisma.sponsorInquiry,
    orderBy: 'createdAt',
    select: { id: true, companyName: true, contactName: true, contactEmail: true, contactPhone: true, partnershipType: true, status: true, createdAt: true },
  },
  subscriptions: {
    model: prisma.subscription,
    orderBy: 'createdAt',
    select: { id: true, userId: true, plan: true, status: true, startDate: true, endDate: true },
  },
  emergencies: {
    model: prisma.emergencyAlert,
    orderBy: 'createdAt',
    select: { id: true, userId: true, alertType: true, status: true, location: true, createdAt: true },
  },
  camps: {
    model: prisma.healthCamp,
    orderBy: 'createdAt',
    select: { id: true, name: true, city: true, date: true, campType: true, createdAt: true },
  },
  bloodDonors: {
    model: prisma.organDonor,
    orderBy: 'createdAt',
    select: { id: true, userId: true, bloodType: true, city: true, isActive: true, createdAt: true },
  },
  organRecipients: {
    model: prisma.organRecipient,
    orderBy: 'createdAt',
    select: { id: true, userId: true, organNeeded: true, bloodType: true, urgency: true, createdAt: true },
  },
  pharmacies: {
    model: prisma.pharmacy,
    orderBy: 'createdAt',
    select: { id: true, name: true, city: true, phone: true, verified: true, createdAt: true },
  },
  labs: {
    model: prisma.lab,
    orderBy: 'createdAt',
    select: { id: true, name: true, city: true, phone: true, createdAt: true },
  },
  insurance: {
    model: prisma.insurancePolicy,
    orderBy: 'createdAt',
    select: { id: true, userId: true, planId: true, status: true, startDate: true, endDate: true, premiumPaid: true, createdAt: true },
  },
  corporate: {
    model: prisma.corporateProgram,
    orderBy: 'createdAt',
    select: { id: true, companyName: true, contactName: true, contactEmail: true, contactPhone: true, employeeCount: true, status: true, createdAt: true },
  },
  wellnessMissions: {
    model: prisma.wellnessMission,
    orderBy: 'createdAt',
    select: { id: true, title: true, category: true, points: true, duration: true, isActive: true, createdAt: true },
  },
  healthRecords: {
    model: prisma.healthRecord,
    orderBy: 'createdAt',
    select: { id: true, userId: true, title: true, type: true, hospital: true, doctor: true, date: true, createdAt: true },
  },
  healthMetrics: {
    model: prisma.healthMetric,
    orderBy: 'createdAt',
    select: { id: true, userId: true, bloodPressure: true, heartRate: true, bloodSugar: true, weight: true, date: true, createdAt: true },
  },
  rewards: {
    model: prisma.reward,
    orderBy: 'createdAt',
    select: { id: true, userId: true, points: true, source: true, description: true, createdAt: true },
  },
  transactions: {
    model: prisma.healthTransaction,
    orderBy: 'createdAt',
    select: { id: true, walletId: true, amount: true, type: true, category: true, createdAt: true },
  },
};

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const table = searchParams.get('table') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  try {
    if (table !== 'all') {
      const config = TABLE_CONFIG[table];
      if (!config) {
        return NextResponse.json({ error: `Unknown table: ${table}` }, { status: 400 });
      }
      const total = await config.model.count();
      const rows = await config.model.findMany({
        select: config.select,
        orderBy: { [config.orderBy || 'createdAt']: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
      return NextResponse.json({ table, total, page, rows });
    }

    const result: Record<string, { total: number; recent: number }> = {};
    for (const [key, config] of Object.entries(TABLE_CONFIG)) {
      const total = await config.model.count();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentField = config.orderBy || 'createdAt';
      const recent = await config.model.count({
        where: { [recentField]: { gte: oneDayAgo } } as any,
      });
      result[key] = { total, recent };
    }
    return NextResponse.json({ tables: result });
  } catch (error) {
    console.error('Admin data API error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
