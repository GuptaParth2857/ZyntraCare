import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const twin = await prisma.digitalTwin.findUnique({ where: { userId: token.id as string } });
    return NextResponse.json({ success: true, twin: twin || null });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch digital twin' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const body = await req.json();
    const twin = await prisma.digitalTwin.upsert({
      where: { userId: token.id as string },
      update: { displayName: body.displayName, avatarData: body.avatarData ? JSON.stringify(body.avatarData) : undefined, healthSummary: body.healthSummary ? JSON.stringify(body.healthSummary) : undefined, lastSyncAt: new Date() },
      create: { userId: token.id as string, displayName: body.displayName, avatarData: body.avatarData ? JSON.stringify(body.avatarData) : null, healthSummary: body.healthSummary ? JSON.stringify(body.healthSummary) : null, lastSyncAt: new Date() },
    });
    return NextResponse.json({ success: true, twin });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update digital twin' }, { status: 500 });
  }
}
