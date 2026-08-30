import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const [medicalId, user] = await Promise.all([
      prisma.medicalID.findUnique({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, age: true, bloodGroup: true } }),
    ]);

    if (!medicalId && !user) {
      return NextResponse.json({ error: 'Medical ID not found' }, { status: 404 });
    }

    const dob = user?.age ? `${new Date().getFullYear() - user.age}-01-01` : '';
    const split = (s: string) => s ? s.split(',').map(x => x.trim()).filter(Boolean) : [];

    const medicalInfo = {
      name: user?.name || '',
      bloodType: medicalId?.bloodGroup || user?.bloodGroup || '',
      allergies: split(medicalId?.allergies || ''),
      medications: split(medicalId?.medications || ''),
      conditions: split(medicalId?.conditions || ''),
      emergencyContacts: [
        { name: medicalId?.emergencyContact1 || '', phone: medicalId?.emergencyPhone1 || '', relation: 'Spouse' },
        { name: medicalId?.emergencyContact2 || '', phone: medicalId?.emergencyPhone2 || '', relation: 'Parent' },
      ],
      doctorName: '',
      doctorPhone: '',
      dob,
      organDonor: medicalId?.organDonor || false,
      insuranceProvider: medicalId?.insuranceProvider || '',
      insuranceNumber: medicalId?.insuranceNumber || '',
      notes: medicalId?.notes || '',
    };

    return NextResponse.json({ medicalInfo });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch medical ID' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId, bloodGroup, allergies, conditions, medications,
      emergencyContact1, emergencyPhone1, emergencyContact2, emergencyPhone2,
      organDonor, insuranceProvider, insuranceNumber, notes,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const medicalId = await prisma.medicalID.upsert({
      where: { userId },
      update: {
        ...(bloodGroup !== undefined && { bloodGroup }),
        ...(allergies !== undefined && { allergies }),
        ...(conditions !== undefined && { conditions }),
        ...(medications !== undefined && { medications }),
        ...(emergencyContact1 !== undefined && { emergencyContact1 }),
        ...(emergencyPhone1 !== undefined && { emergencyPhone1 }),
        ...(emergencyContact2 !== undefined && { emergencyContact2 }),
        ...(emergencyPhone2 !== undefined && { emergencyPhone2 }),
        ...(organDonor !== undefined && { organDonor }),
        ...(insuranceProvider !== undefined && { insuranceProvider }),
        ...(insuranceNumber !== undefined && { insuranceNumber }),
        ...(notes !== undefined && { notes }),
      },
      create: {
        userId,
        bloodGroup: bloodGroup || '',
        allergies: allergies || '',
        conditions: conditions || '',
        medications: medications || '',
        emergencyContact1: emergencyContact1 || '',
        emergencyPhone1: emergencyPhone1 || '',
        emergencyContact2: emergencyContact2 || '',
        emergencyPhone2: emergencyPhone2 || '',
        organDonor: organDonor || false,
        insuranceProvider: insuranceProvider || '',
        insuranceNumber: insuranceNumber || '',
        notes: notes || '',
      },
    });

    return NextResponse.json({ success: true, medicalId });
  } catch {
    return NextResponse.json({ error: 'Failed to save medical ID' }, { status: 500 });
  }
}
