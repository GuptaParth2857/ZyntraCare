import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sosSenders = ['ParthPhone', 'Aarav-N10', 'Kavita-M32', 'Relay⚡DP1'];
    const now = new Date();
    let recipientCount = 0;

    for (const sender of sosSenders) {
      await prisma.meshMessage.create({
        data: {
          senderId: sender === 'ParthPhone' ? 'demo-user' : null,
          senderName: sender,
          content: `🚨 SOS from ${sender} — help needed at ${body.latitude || 'multiple'} ${body.longitude || 'locations'}`,
          latitude: body.latitude || null,
          longitude: body.longitude || null,
          deviceId: body.deviceId || `zc-${sender.toLowerCase()}`,
          hopCount: 1,
          createdAt: now,
        },
      });
      recipientCount++;
    }

    await prisma.meshMessage.create({
      data: {
        senderId: null,
        senderName: 'Mesh Relay',
        content: `🛰️ Received & relayed by ${recipientCount} nearby nodes. Emergency services notified.`,
        createdAt: new Date(now.getTime() + 500),
        hopCount: recipientCount,
      },
    });

    const raw = await prisma.meshMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 30 });
    const messages = raw.map((m) => ({
      id: m.id,
      from: m.senderName,
      message: m.content,
      type: m.content.startsWith('🚨') ? 'SOS' : m.content.includes('relayed') ? 'info' : 'response',
      timestamp: new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      hops: m.hopCount,
      reached: m.content.startsWith('🛰️'),
    }));

    return NextResponse.json({ messages, broadcasted: recipientCount }, { status: 201 });
  } catch (error) {
    console.error('Mesh SOS POST error:', error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}