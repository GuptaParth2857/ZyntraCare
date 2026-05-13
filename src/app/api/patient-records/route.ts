import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { validateBody, patientRecordSchema } from '@/lib/validations';

async function authenticateRequest(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: false });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const authError = await authenticateRequest(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: false });
    const requestingUserId = token?.id as string;
    const role = token?.role as string;

    if (role !== 'admin' && requestingUserId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

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
  const authError = await authenticateRequest(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const validation = validateBody(patientRecordSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { userId, bloodType, allergies, medicalHistory, emergencyContact, emergencyContactPhone, dateOfBirth, gender } = validation.data;

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: false });
    const requestingUserId = token?.id as string;
    const role = token?.role as string;

    if (role !== 'admin' && requestingUserId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
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
  const authError = await authenticateRequest(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const validation = validateBody(patientRecordSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { userId, bloodType, allergies, medicalHistory, emergencyContact, emergencyContactPhone, dateOfBirth, gender } = validation.data;

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: false });
    const requestingUserId = token?.id as string;
    const role = token?.role as string;

    if (role !== 'admin' && requestingUserId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
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