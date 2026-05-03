import { NextRequest, NextResponse } from 'next/server';

interface CacheEntry {
  data: unknown;
  expiry: number;
}

const memoryCache: Map<string, CacheEntry> = new Map();

export function getCached(key: string): unknown | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiry) {
    memoryCache.delete(key);
    return null;
  }
  
  return entry.data;
}

export function setCache(key: string, data: unknown, ttlSeconds: number = 60): void {
  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

export function withCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { ttl?: number; cacheKey?: (req: NextRequest) => string }
) {
  return async function(req: NextRequest): Promise<NextResponse> {
    if (req.method !== 'GET') {
      return handler(req);
    }

    const cacheKey = options.cacheKey 
      ? options.cacheKey(req) 
      : req.url;
    
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': `public, max-age=${options.ttl || 60}`,
        },
      });
    }

    const response = await handler(req);
    
    if (response.status === 200) {
      const data = await response.json();
      setCache(cacheKey, data, options.ttl || 60);
      return NextResponse.json(data, {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': `public, max-age=${options.ttl || 60}`,
        },
      });
    }

    return response;
  };
}

export function clearCache(): void {
  memoryCache.clear();
}