import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';

  try {
    const where: any = {};
    if (userId) where.userId = userId;

    const members = await prisma.familyMember.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Family members GET error:', error);
    return NextResponse.json({ members: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const member = await prisma.familyMember.create({
      data: {
        userId: body.userId,
        name: body.name,
        relation: body.relation,
        age: body.age || null,
        bloodGroup: body.bloodGroup || null,
        gender: body.gender || null,
        phone: body.phone || null,
        email: body.email || null,
        conditions: JSON.stringify(body.conditions || []),
        medications: JSON.stringify(body.medications || []),
        isEmergency: body.isEmergency || false,
      },
    });
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('Family members POST error:', error);
    return NextResponse.json({ error: 'Failed to create family member' }, { status: 500 });
  }
}
