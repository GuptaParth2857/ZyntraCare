import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimitMiddleware } from './lib/rate-limit';

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResponse = rateLimitMiddleware(request, 100, 60000);
    if (rateLimitResponse) return rateLimitResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
