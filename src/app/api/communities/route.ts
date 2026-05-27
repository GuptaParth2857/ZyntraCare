import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';

  try {
    const where: any = { isActive: true };
    if (category) where.category = category;

    const communities = await prisma.community.findMany({
      where,
      orderBy: { memberCount: 'desc' },
      take: 20,
    });

    return NextResponse.json({ communities });
  } catch (error) {
    console.error('Communities GET error:', error);
    return NextResponse.json({ communities: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const community = await prisma.community.create({
      data: {
        name: body.name,
        description: body.description || '',
        category: body.category || 'General',
        image: body.image || '',
        createdBy: body.createdBy || null,
      },
    });
    return NextResponse.json({ community }, { status: 201 });
  } catch (error) {
    console.error('Communities POST error:', error);
    return NextResponse.json({ error: 'Failed to create community' }, { status: 500 });
  }
}
