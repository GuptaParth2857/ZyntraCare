import { NextResponse } from 'next/server';
import { getCacheValue, setCacheValue } from './cache';
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
      const rateLimitResponse = await authRateLimit(
        request as any,
        options.rateLimit.limit,
        options.rateLimit.windowMs
      );
      if (rateLimitResponse) return rateLimitResponse;
    }

    if (options.cache && request.method === 'GET') {
      const cached = await getCacheValue<any>(options.cache.key);
      if (cached) {
        return NextResponse.json(cached, {
          headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=60' },
        });
      }
    }

    const response = await handler(request, ...args);

    if (options.cache && request.method === 'GET' && response.ok) {
      const data = await response.clone().json();
      await setCacheValue(options.cache.key, data, options.cache.ttl);
    }

    return response;
  };
}
