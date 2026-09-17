import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function resolveUserId(token: any, requested: string | null): string {
  if (token?.sub) return token.sub;
  if (requested === 'demo-user') return 'demo-user';
  return '';
}

function parseJson(raw: string | null, fallback: any = null): any {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function mapOrder(o: any) {
  return {
    id: o.id,
    trackingId: o.trackingId,
    items: parseJson(o.items, []),
    pharmacy: parseJson(o.pharmacy, {}),
    address: o.address,
    total: o.total,
    payment: o.payment,
    status: o.status,
    createdAt: o.createdAt,
  };
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { searchParams } = new URL(req.url);
  const userId = resolveUserId(token, searchParams.get('userId'));
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const orders = await prisma.medicineOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders: orders.map(mapOrder) });
  } catch (error) {
    console.error('Medicine orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const body = await req.json().catch(() => ({}));
  const requested = String(body.userId || '');
  const userId = resolveUserId(token, requested === 'demo-user' ? 'demo-user' : null);
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  if (items.length === 0) {
    return NextResponse.json({ error: 'No medicines in order' }, { status: 400 });
  }
  const name = String(body.name || '').trim();
  const address = String(body.address || '').trim();
  if (!name || !address) {
    return NextResponse.json({ error: 'Delivery name and address are required' }, { status: 400 });
  }
  const pharmacy = body.pharmacy && typeof body.pharmacy === 'object' ? body.pharmacy : {};
  if (!String(pharmacy.name || '').trim()) {
    return NextResponse.json({ error: 'Pharmacy is required' }, { status: 400 });
  }
  const total = Number(body.total);
  if (!Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
  }
  const payment = String(body.payment || 'cod');
  if (!['cod', 'upi', 'card'].includes(payment)) {
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
  }

  const trackingId = `ZYN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  try {
    const order = await prisma.medicineOrder.create({
      data: {
        userId,
        trackingId,
        items: JSON.stringify(items),
        pharmacy: JSON.stringify(pharmacy),
        address: `${name} — ${address}`.slice(0, 500),
        total,
        payment,
      },
    });
    return NextResponse.json({ order: mapOrder(order) }, { status: 201 });
  } catch (error) {
    console.error('Medicine orders POST error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}