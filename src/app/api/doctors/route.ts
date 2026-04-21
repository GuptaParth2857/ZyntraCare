import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specialty = searchParams.get('specialty');
  const isAvailable = searchParams.get('isAvailable');
  const hospitalId = searchParams.get('hospitalId');
  
  try {
    const where: any = {};
    if (specialty) where.specialty = specialty;
    if (isAvailable) where.isAvailable = isAvailable === 'true';
    
    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: true,
        hospitalLinks: {
          include: { hospital: true },
        },
        appointments: {
          where: { date: new Date().toISOString().split('T')[0] },
          take: 5,
        },
      },
    });
    
    return NextResponse.json({ doctors });
  } catch (error) {
    console.error('Doctor API error:', error);
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, specialty, license, experience, bio, education, languages, consultingFee, isAvailable } = body;
    
    if (!userId || !specialty || !license) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const doctor = await prisma.doctor.create({
      data: {
        userId,
        specialty,
        license,
        experience: experience || 0,
        bio: bio || '',
        education: education || '',
        languages: languages || 'English',
        consultingFee: consultingFee || 500,
        isAvailable: isAvailable ?? true,
      },
    });
    
    return NextResponse.json({ doctor });
  } catch (error) {
    console.error('Create doctor error:', error);
    return NextResponse.json({ error: 'Failed to create doctor' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctorId, specialty, experience, bio, education, languages, consultingFee, isAvailable } = body;
    
    if (!doctorId) {
      return NextResponse.json({ error: 'Missing doctorId' }, { status: 400 });
    }
    
    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        specialty,
        experience,
        bio,
        education,
        languages,
        consultingFee,
        isAvailable,
      },
    });
    
    return NextResponse.json({ doctor });
  } catch (error) {
    console.error('Update doctor error:', error);
    return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 });
  }
}