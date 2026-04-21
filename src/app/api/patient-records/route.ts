import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  
  try {
    const record = await prisma.patientRecord.findUnique({
      where: { userId },
    });
    
    return NextResponse.json({ record });
  } catch (error) {
    console.error('Patient record error:', error);
    return NextResponse.json({ error: 'Failed to fetch record' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, bloodType, allergies, medicalHistory, emergencyContact, emergencyContactPhone, dateOfBirth, gender } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    const record = await prisma.patientRecord.upsert({
      where: { userId },
      update: {
        bloodType,
        allergies,
        medicalHistory,
        emergencyContact,
        emergencyContactPhone,
        dateOfBirth,
        gender,
      },
      create: {
        userId,
        bloodType,
        allergies,
        medicalHistory,
        emergencyContact,
        emergencyContactPhone,
        dateOfBirth,
        gender,
      },
    });
    
    return NextResponse.json({ record });
  } catch (error) {
    console.error('Create patient record error:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, bloodType, allergies, medicalHistory, emergencyContact, emergencyContactPhone, dateOfBirth, gender } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    const record = await prisma.patientRecord.update({
      where: { userId },
      data: {
        bloodType,
        allergies,
        medicalHistory,
        emergencyContact,
        emergencyContactPhone,
        dateOfBirth,
        gender,
      },
    });
    
    return NextResponse.json({ record });
  } catch (error) {
    console.error('Update patient record error:', error);
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}