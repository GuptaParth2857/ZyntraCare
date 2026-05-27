import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataType = searchParams.get('type');
  
  try {
    const where: any = { status: 'ACTIVE' };
    if (dataType) where.dataType = dataType;
    
    const listings = await prisma.dataListing.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    return NextResponse.json({ success: true, listings, total: listings.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const body = await req.json();
    const listing = await prisma.dataListing.create({
      data: {
        userId: token.id as string,
        title: body.title,
        description: body.description,
        dataType: body.dataType || 'health_record',
        price: body.price || 0,
        format: body.format || 'JSON',
        isAnonymized: body.isAnonymized !== false,
      },
    });
    return NextResponse.json({ success: true, listing });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const body = await req.json();
    const listing = await prisma.dataListing.updateMany({
      where: { id: body.id, userId: token.id as string },
      data: { status: body.status },
    });
    return NextResponse.json({ success: true, listing });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
