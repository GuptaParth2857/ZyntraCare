import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';

  try {
    const where: any = {};
    if (userId) where.userId = userId;

    const pets = await prisma.pet.findMany({
      where,
      include: { vaccinations: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ pets });
  } catch (error) {
    console.error('Pets GET error:', error);
    return NextResponse.json({ pets: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pet = await prisma.pet.create({
      data: {
        userId: body.userId,
        name: body.name,
        species: body.species || 'dog',
        breed: body.breed || '',
        age: body.age || null,
        weight: body.weight || null,
        color: body.color || '',
        microchip: body.microchip || '',
        notes: body.notes || '',
        image: body.image || '',
      },
    });
    return NextResponse.json({ pet }, { status: 201 });
  } catch (error) {
    console.error('Pets POST error:', error);
    return NextResponse.json({ error: 'Failed to create pet' }, { status: 500 });
  }
}
