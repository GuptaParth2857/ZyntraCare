import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimitMiddleware(
  request: NextRequest,
  limit: number = 10,
  windowMs: number = 60 * 1000 // 1 minute
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] 
    || request.headers.get('x-real-ip') 
    || 'unknown';
  
  const now = Date.now();
  const key = `ratelimit:${ip}`;
  
  // Clean up old entries
  if (store[key] && store[key].resetTime < now) {
    delete store[key];
  }
  
  // Initialize if not exists
  if (!store[key]) {
    store[key] = { count: 0, resetTime: now + windowMs };
  }
  
  store[key].count++;
  
  if (store[key].count > limit) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  return null;
}

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { limit?: number; windowMs?: number } = {}
) {
  return async function(req: NextRequest): Promise<NextResponse> {
    const block = rateLimitMiddleware(req, options.limit, options.windowMs);
    if (block) return block;
    return handler(req);
  };
}

// Rate limiter for auth endpoints
export function authRateLimit(req: NextRequest): NextResponse | null {
  return rateLimitMiddleware(req, 5, 60 * 1000); // 5 attempts per minute
}

// Rate limiter for general API
export function apiRateLimit(req: NextRequest): NextResponse | null {
  return rateLimitMiddleware(req, 30, 60 * 1000); // 30 requests per minute
}