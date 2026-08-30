import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const raw = await prisma.meshMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    const messages = raw.map((m) => ({
      id: m.id,
      from: m.senderName,
      message: m.content,
      type: (m.content.includes('SOS') || m.content.startsWith('🚨')) ? 'SOS' : 'relay',
      timestamp: new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      hops: m.hopCount,
      reached: true,
    }));
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Mesh messages GET error:', error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = await prisma.meshMessage.create({
      data: {
        senderId: 'demo-user',
        senderName: 'ParthPhone',
        content: body.message || body.content || 'hello from mesh',
        deviceId: 'zc-phone',
        hopCount: body.hopCount || 2,
      },
    });
    const raw = await prisma.meshMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    const messages = raw.map((m) => ({
      id: m.id,
      from: m.senderName,
      message: m.content,
      type: m.id === message.id || m.content.includes('SOS') ? (m.content.startsWith('🚨') ? 'SOS' : 'info') : 'relay',
      timestamp: new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      hops: m.hopCount,
      reached: true,
    }));
    return NextResponse.json({ messages }, { status: 201 });
  } catch (error) {
    console.error('Mesh messages POST error:', error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}