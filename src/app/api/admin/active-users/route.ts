/**
 * /api/admin/active-users — tracks active sessions using database.
 * POST → register user heartbeat
 * GET  → return current active user count + list (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

async function requireAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: false });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return null;
}

const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function pruneExpired() {
  const cutoff = new Date(Date.now() - SESSION_TTL_MS);
  await prisma.userSession.deleteMany({
    where: { expiresAt: { lt: cutoff } }
  });
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  await pruneExpired();
  
  const sessions = await prisma.userSession.findMany({
    select: { id: true, device: true, ipAddress: true, expiresAt: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return NextResponse.json({
    count: sessions.length,
    users: sessions.map(s => ({
      id: s.id,
      device: s.device,
      ipAddress: s.ipAddress,
      lastSeen: s.expiresAt.toISOString()
    })),
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, email, page, device, ipAddress } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await prisma.userSession.upsert({
      where: { id: userId },
      update: { expiresAt, device, ipAddress },
      create: {
        userId,
        token: `session_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        device: device || 'web',
        ipAddress: ipAddress || 'unknown',
        expiresAt
      }
    });

    const count = await prisma.userSession.count({ where: { expiresAt: { gt: new Date() } } });

    return NextResponse.json({ ok: true, activeCount: count });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { sessionId } = await req.json();
  if (sessionId) {
    await prisma.userSession.delete({ where: { id: sessionId } }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}