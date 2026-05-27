import { NextResponse } from 'next/server';
import { getCached, setCache } from './cache';
import { authRateLimit } from './rate-limit';

interface ApiHandlerOptions {
  cache?: {
    ttl: number;
    key: string;
  };
  rateLimit?: {
    limit: number;
    windowMs: number;
  };
}

type ApiHandler = (request: Request, ...args: any[]) => Promise<NextResponse>;

export function withMiddleware(handler: ApiHandler, options: ApiHandlerOptions = {}): ApiHandler {
  return async (request: Request, ...args: any[]) => {
    if (options.rateLimit) {
      const rateLimitResponse = authRateLimit(
        request as any,
        options.rateLimit.limit,
        options.rateLimit.windowMs
      );
      if (rateLimitResponse) return rateLimitResponse;
    }

    if (options.cache && request.method === 'GET') {
      const cached = getCached<any>(options.cache.key);
      if (cached) {
        return NextResponse.json(cached, {
          headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=60' },
        });
      }
    }

    const response = await handler(request, ...args);

    if (options.cache && request.method === 'GET' && response.ok) {
      const data = await response.clone().json();
      setCache(options.cache.key, data, options.cache.ttl);
    }

    return response;
  };
}
