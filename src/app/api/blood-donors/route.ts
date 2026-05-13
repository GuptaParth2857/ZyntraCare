import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bloodGroup = searchParams.get('bloodGroup');
  const city = searchParams.get('city');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const where: any = {
      bloodGroup: { not: null },
    };

    if (bloodGroup) {
      where.bloodGroup = bloodGroup;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    const [donors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          bloodGroup: true,
          city: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      donors: donors.map(d => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        bloodGroup: d.bloodGroup,
        city: d.city,
        available: true,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
      bloodGroups: BLOOD_GROUPS,
    });
  } catch (error) {
    console.error('Blood donors API error:', error);
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, bloodGroup, city } = body;

    if (!bloodGroup) {
      return NextResponse.json({ error: 'bloodGroup is required' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { phone } });
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { bloodGroup, city },
      });
      return NextResponse.json({ message: 'Donor updated successfully' });
    }

    const donor = await prisma.user.create({
      data: {
        email: email || `donor_${Date.now()}@bloodbank.com`,
        name: name || 'Anonymous Donor',
        phone: phone || '',
        bloodGroup,
        city: city || '',
        role: 'patient',
      },
    });

    return NextResponse.json({
      message: 'Registered as blood donor',
      donor: { id: donor.id, name: donor.name, bloodGroup: donor.bloodGroup },
    });
  } catch (error) {
    console.error('Blood donor POST error:', error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}