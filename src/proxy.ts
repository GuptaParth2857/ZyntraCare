import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimitMiddleware } from './lib/rate-limit';

const publicRoutes = [
  '/', '/auth/signin', '/forgot-password', '/reset-password',
  '/verify-email', '/install', '/emergency', '/ambulance', '/sms-emergency',
  '/voice-emergency', '/first-aid', '/hospitals', '/doctors',
  '/doctors/register', '/blogs', '/contact', '/feedback', '/legal',
  '/subscription', '/medicine-verify', '/pill-scanner',
];

const adminRoutes = ['/admin', '/admin/users', '/admin/data', '/admin/god-mode'];

function withSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API rate limiting & CORS
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Rate limit headers for tracking
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    response.headers.set('X-RateLimit-IP', ip);

    const rateLimitResponse = await rateLimitMiddleware(request, 100, 60000);
    if (rateLimitResponse) return withSecurityHeaders(rateLimitResponse);
    if (pathname.startsWith('/api/auth/')) return withSecurityHeaders(response);
    return withSecurityHeaders(response);
  }

  // Skip auth for static files and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/robots') ||
    publicRoutes.some(r => pathname.startsWith(r))
  ) {
    return withSecurityHeaders(NextResponse.next());
  }

  // Check authentication for protected routes
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return withSecurityHeaders(NextResponse.redirect(signInUrl));
  }

  // Admin route protection
  const role = token.role as string;
  if (adminRoutes.some(r => pathname.startsWith(r)) && role !== 'admin') {
    return withSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
