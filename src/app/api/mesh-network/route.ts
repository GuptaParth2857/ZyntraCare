import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const messages = await prisma.meshMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Mesh network GET error:', error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = await prisma.meshMessage.create({
      data: {
        senderId: body.senderId || null,
        senderName: body.senderName || 'Anonymous',
        content: body.content,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        deviceId: body.deviceId || null,
        hopCount: body.hopCount || 0,
      },
    });
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Mesh network POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
