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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Missing member id' }, { status: 400 });
    }
    const member = await prisma.familyMember.update({
      where: { id: body.id },
      data: {
        name: body.name ?? undefined,
        relation: body.relation ?? undefined,
        age: body.age ?? undefined,
        bloodGroup: body.bloodGroup ?? undefined,
        gender: body.gender ?? undefined,
        phone: body.phone ?? undefined,
        email: body.email ?? undefined,
        conditions: body.conditions ? JSON.stringify(body.conditions) : undefined,
        medications: body.medications ? JSON.stringify(body.medications) : undefined,
        isEmergency: body.isEmergency ?? undefined,
      },
    });
    return NextResponse.json({ member });
  } catch (error) {
    console.error('Family members PUT error:', error);
    return NextResponse.json({ error: 'Failed to update family member' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing member id' }, { status: 400 });
    }
    await prisma.familyMember.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Family members DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete family member' }, { status: 500 });
  }
}
