import NextAuth from 'next-auth';
import { authOptions } from './options';

let _handlers: { GET: Function; POST: Function } | null = null;

async function getHandlers() {
  if (!_handlers) {
    const result = NextAuth(authOptions);
    _handlers = result.handlers;
  }
  return _handlers;
}

export async function GET(req: Request) {
  try {
    const handlers = await getHandlers();
    return await handlers.GET(req);
  } catch (e) {
    console.error('[Auth] GET error:', e);
    return Response.json({ user: null }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const handlers = await getHandlers();
    return await handlers.POST(req);
  } catch (e) {
    console.error('[Auth] POST error:', e);
    return Response.json({ error: 'Authentication error' }, { status: 500 });
  }
}
