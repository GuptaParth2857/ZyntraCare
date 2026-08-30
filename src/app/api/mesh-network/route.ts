import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const NODE_NAMES = ['ParthPhone', 'Aarav-N10', 'Kavita-M32', 'Rahul-Phone', 'Relay⚡DP1', 'Nisha-A14', 'Vikram-P5', 'Sneha-Phone'];

function generateNodes(seedId: string) {
  const nodes = NODE_NAMES.map((name, i) => {
    const distance = Math.round((Math.random() * 400 + 50 + i * 37) / 10) * 10;
    const hourAgo = new Date(Date.now() - (i % 4) * 60000 - i * 13000);
    return {
      id: `node-${seedId}-${i}`,
      name,
      distance,
      signal: Math.min(98, 35 + Math.floor(Math.random() * 60)),
      isRelay: name.includes('Relay') || i % 3 === 0,
      lastSeen: hourAgo.toISOString(),
    };
  });
  return nodes.sort((a, b) => a.distance - b.distance);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const [raw, nodes] = await Promise.all([
      prisma.meshMessage.findMany({ orderBy: { createdAt: 'desc' }, take: limit }),
      Promise.resolve(generateNodes('zc')),
    ]);

    const messages = raw.map((m) => ({
      id: m.id,
      from: m.senderName,
      message: m.content,
      type: (m.content.includes('SOS') || m.content.startsWith('🚨')) ? 'SOS' : 'relay',
      timestamp: new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      hops: m.hopCount,
      reached: true,
    }));

    return NextResponse.json({ nodes, messages });
  } catch (error) {
    console.error('Mesh network GET error:', error);
    return NextResponse.json({ nodes: generateNodes('zc'), messages: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = await prisma.meshMessage.create({
      data: {
        senderId: body.senderId || 'demo-user',
        senderName: body.senderName || 'ParthPhone',
        content: body.content || body.message || 'Connecting to mesh network…',
        latitude: body.latitude || body.lat || null,
        longitude: body.longitude || body.lng || null,
        deviceId: body.deviceId || 'zc-phone',
        hopCount: body.hopCount || 1,
      },
    });
    return NextResponse.json({
      nodes: generateNodes('zc'),
      message,
      messages: [
        {
          id: message.id,
          from: message.senderName,
          message: message.content,
          type: 'info',
          timestamp: new Date(message.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
          hops: message.hopCount,
          reached: true,
        },
      ],
    }, { status: 201 });
  } catch (error) {
    console.error('Mesh network POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}