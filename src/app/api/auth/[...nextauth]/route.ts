import NextAuth from 'next-auth';
import { authOptions } from './options';

let handlers: { GET: Function; POST: Function } | null = null;

try {
  const result = NextAuth(authOptions as any);
  handlers = result.handlers;
} catch (e) {
  console.error('[Auth] Failed to initialize NextAuth:', e);
}

export async function GET(req: Request) {
  if (!handlers) {
    return Response.json({ error: 'Auth not configured' }, { status: 500 });
  }
  try {
    return await handlers.GET(req);
  } catch (e: any) {
    console.error('[Auth] GET error:', e);
    return Response.json({ error: 'Authentication error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!handlers) {
    return Response.json({ error: 'Auth not configured' }, { status: 500 });
  }
  try {
    return await handlers.POST(req);
  } catch (e: any) {
    console.error('[Auth] POST error:', e);
    return Response.json({ error: 'Authentication error' }, { status: 500 });
  }
}