import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specialty = searchParams.get('specialty');
  const isAvailable = searchParams.get('isAvailable');
  const city = searchParams.get('city');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  try {
    const where: any = {};
    
    if (specialty) {
      where.specialty = { contains: specialty };
    }
    
    if (isAvailable === 'true') {
      where.isAvailable = true;
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { experience: 'desc' },
      }),
      prisma.doctor.count({ where }),
    ]);

    const specialties = await prisma.doctor.findMany({
      select: { specialty: true },
      distinct: ['specialty'],
    });

    const formattedDoctors = doctors.map(d => ({
      id: d.id,
      name: d.user.name || 'Doctor',
      specialty: d.specialty,
      experience: d.experience,
      fee: d.consultingFee,
      rating: Math.min(5, Math.max(3, 3.5 + d.experience * 0.02)),
      isAvailable: d.isAvailable,
      education: d.education,
      bio: d.bio,
      languages: d.languages,
    }));

    return NextResponse.json({
      doctors: formattedDoctors,
      total,
      page,
      pages: Math.ceil(total / limit),
      specialties: specialties.map(s => s.specialty),
    });
  } catch (error) {
    console.error('Doctor API error:', error);
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, specialty, license, experience, bio, education, consultingFee } = body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await import('bcryptjs').then(b => b.hash('doctor123', 12));

    const user = await prisma.user.create({
      data: { email, name, passwordHash: hashedPassword, role: 'doctor' },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialty,
        license,
        experience: experience || 0,
        bio: bio || '',
        education: education || '',
        consultingFee: consultingFee || 500,
        isAvailable: true,
      },
    });

    return NextResponse.json({ doctor, message: 'Doctor registered successfully' });
  } catch (error) {
    console.error('Doctor POST error:', error);
    return NextResponse.json({ error: 'Failed to register doctor' }, { status: 500 });
  }
}