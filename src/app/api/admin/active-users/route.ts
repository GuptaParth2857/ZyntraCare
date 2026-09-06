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
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return NextResponse.json({
    count: sessions.length,
    users: sessions.map(s => ({
      id: s.id,
      name: s.user?.name || s.user?.email || 'Guest',
      email: s.user?.email || '',
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
    const { sessionId, userId, device, ipAddress } = body;

    if (!sessionId || !userId) {
      return NextResponse.json({ error: 'sessionId and userId required' }, { status: 400 });
    }

    const forwarded = req.headers.get('x-forwarded-for');
    const remoteAddr = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await prisma.userSession.upsert({
      where: { id: sessionId },
      update: {
        userId,
        expiresAt,
        device: device || 'web',
        ipAddress: ipAddress || remoteAddr,
      },
      create: {
        id: sessionId,
        userId,
        token: `session_${sessionId}`,
        device: device || 'web',
        ipAddress: ipAddress || remoteAddr,
        expiresAt,
      },
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