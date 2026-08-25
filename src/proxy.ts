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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API rate limiting
  if (pathname.startsWith('/api/')) {
    const rateLimitResponse = await rateLimitMiddleware(request, 100, 60000);
    if (rateLimitResponse) return rateLimitResponse;
    if (pathname.startsWith('/api/auth/')) return NextResponse.next();
    return NextResponse.next();
  }

  // Skip auth for static files and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/robots') ||
    publicRoutes.some(r => pathname.startsWith(r))
  ) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Admin route protection
  const role = token.role as string;
  if (adminRoutes.some(r => pathname.startsWith(r)) && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
