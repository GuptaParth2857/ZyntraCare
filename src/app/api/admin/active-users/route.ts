/**
 * /api/admin/active-users — tracks active sessions.
 *
 * Uses a simple in-memory Map for demo (use Redis or DB in production).
 * POST → register user heartbeat
 * GET  → return current active user count + list
 */
import { NextRequest, NextResponse } from 'next/server';

/* -------------------------------------------------------------------------- */
/*  In-memory store (resets on cold start — use Redis in production)           */
/* -------------------------------------------------------------------------- */
declare global {
  // eslint-disable-next-line no-var
  var _activeUsersStore: Map<string, { name: string; email: string; lastSeen: number; page: string }> | undefined;
}

// Persist across hot-reloads in dev
const store: Map<string, { name: string; email: string; lastSeen: number; page: string }> =
  global._activeUsersStore ?? (global._activeUsersStore = new Map());

const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

function pruneExpired() {
  const now = Date.now();
  store.forEach((data, id) => {
    if (now - data.lastSeen > SESSION_TTL_MS) {
      store.delete(id);
    }
  });
}

/* -------------------------------------------------------------------------- */
/*  GET — list active users                                                    */
/* -------------------------------------------------------------------------- */
export async function GET() {
  pruneExpired();
  const users: Array<{ name: string; email: string; page: string; lastSeen: string }> = [];
  store.forEach((u) => {
    users.push({
      name:     u.name,
      email:    u.email,
      page:     u.page,
      lastSeen: new Date(u.lastSeen).toISOString(),
    });
  });
  return NextResponse.json({
    count: store.size,
    users,
    timestamp: new Date().toISOString(),
  });
}

/* -------------------------------------------------------------------------- */
/*  POST — heartbeat from client                                               */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, name, email, page } = body as {
      sessionId: string;
      name: string;
      email: string;
      page: string;
    };

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    store.set(sessionId, { name: name || 'Anonymous', email: email || '', page: page || '/', lastSeen: Date.now() });
    pruneExpired();

    return NextResponse.json({ ok: true, activeCount: store.size });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

/* -------------------------------------------------------------------------- */
/*  DELETE — explicit sign-out                                                  */
/* -------------------------------------------------------------------------- */
export async function DELETE(req: NextRequest) {
  const { sessionId } = await req.json();
  if (sessionId) store.delete(sessionId);
  return NextResponse.json({ ok: true });
}
