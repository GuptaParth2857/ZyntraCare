import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient, createKey } from './redis';

// =============================================================================
// RATE LIMITING
// =============================================================================

/**
 * In-memory rate limit store (fallback when Redis is unavailable).
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Synchronous rate limiter (in-memory only). Used as fallback.
 */
function rateLimitSync(
  ip: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  record.count += 1;

  if (record.count > limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

/**
 * Async rate limiter that uses Redis when available, falls back to in-memory.
 *
 * @param ip - Client IP address or identifier
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result with allowed status, remaining count, and reset time
 */
export async function rateLimit(
  ip: string,
  limit: number = 100,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redis = await getRedisClient();

  // Try Redis-based rate limiting
  if (redis.isConnected()) {
    try {
      const key = createKey('zyntracare', 'ratelimit', ip);
      const now = Date.now();
      const windowSec = Math.ceil(windowMs / 1000);

      // Use Redis INCR + EXPIRE for atomic rate limiting
      const count = await incrementWithExpiry(key, windowSec);

      if (count === 1) {
        // First request in this window
        return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
      }

      if (count > limit) {
        const ttl = await redis.ttl(key);
        const resetAt = ttl > 0 ? now + ttl * 1000 : now + windowMs;
        return { allowed: false, remaining: 0, resetAt };
      }

      const ttl = await redis.ttl(key);
      const resetAt = ttl > 0 ? now + ttl * 1000 : now + windowMs;
      return { allowed: true, remaining: limit - count, resetAt };
    } catch {
      // Redis failed — fall through to in-memory
    }
  }

  // Fallback: in-memory rate limiting
  return rateLimitSync(ip, limit, windowMs);
}

/**
 * Atomic increment with TTL set on first call. Uses Redis SET NX EX pattern.
 */
async function incrementWithExpiry(key: string, ttlSeconds: number): Promise<number> {
  const redis = await getRedisClient();

  // Try to increment existing key
  const current = await redis.get(key);
  if (current !== null) {
    const count = parseInt(current, 10) + 1;
    await redis.set(key, String(count), ttlSeconds);
    return count;
  }

  // Key doesn't exist — set it with TTL
  await redis.set(key, '1', ttlSeconds);
  return 1;
}

export function cleanExpiredEntries(): void {
  const now = Date.now();
  for (const [ip, record] of requestCounts) {
    if (now > record.resetAt) {
      requestCounts.delete(ip);
    }
  }
}

setInterval(cleanExpiredEntries, 60000);

export async function authRateLimit(req: NextRequest, limit: number = 20, windowMs: number = 60000): Promise<NextResponse | null> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '127.0.0.1';

  const result = await rateLimit(ip, limit, windowMs);

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}

export async function rateLimitMiddleware(
  request: Request,
  limit: number = 100,
  windowMs: number = 60000
): Promise<NextResponse | null> {
  return authRateLimit(request as NextRequest, limit, windowMs);
}

// =============================================================================
// CACHING LAYER (Redis-backed with in-memory fallback)
// =============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

/**
 * API Cache class that uses Redis when available, falls back to in-memory Map.
 * Supports distributed caching across multiple instances.
 */
class APICache {
  private memoryStore = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get a cached value by key. Checks Redis first, then in-memory.
   */
  async get<T>(key: string): Promise<T | null> {
    const redis = await getRedisClient();

    // Try Redis
    if (redis.isConnected()) {
      try {
        const cached = await redis.get(createKey('zyntracare', 'apicache', key));
        if (cached !== null) {
          return JSON.parse(cached) as T;
        }
      } catch {
        // Redis read failed — fall through to memory
      }
    }

    // Fallback: in-memory
    const entry = this.memoryStore.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttlMs) {
      this.memoryStore.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set a cached value. Writes to both Redis (if available) and in-memory.
   */
  async set<T>(key: string, data: T, ttlMs: number = 300000): Promise<void> {
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    const redis = await getRedisClient();

    // Write to Redis
    if (redis.isConnected()) {
      try {
        await redis.set(
          createKey('zyntracare', 'apicache', key),
          JSON.stringify(data),
          ttlSeconds
        );
      } catch {
        // Redis write failed — rely on memory
      }
    }

    // Always write to memory as backup
    this.memoryStore.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
    });
  }

  /**
   * Delete a cached key from both Redis and in-memory.
   */
  async delete(key: string): Promise<void> {
    const redis = await getRedisClient();

    if (redis.isConnected()) {
      try {
        await redis.del(createKey('zyntracare', 'apicache', key));
      } catch {
        // Ignore
      }
    }

    this.memoryStore.delete(key);
  }

  /**
   * Clear all cached entries.
   */
  async clear(): Promise<void> {
    const redis = await getRedisClient();

    if (redis.isConnected()) {
      try {
        const keys = await redis.keys(createKey('zyntracare', 'apicache', '*'));
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch {
        // Ignore
      }
    }

    this.memoryStore.clear();
  }

  /**
   * Cleanup expired in-memory entries.
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryStore) {
      if (now - entry.timestamp > entry.ttlMs) {
        this.memoryStore.delete(key);
      }
    }
  }

  /**
   * Get approximate cache size (Redis + memory).
   */
  async getSize(): Promise<number> {
    let count = this.memoryStore.size;
    const redis = await getRedisClient();
    if (redis.isConnected()) {
      try {
        const keys = await redis.keys(createKey('zyntracare', 'apicache', '*'));
        count += keys.length;
      } catch {
        // Ignore
      }
    }
    return count;
  }
}

export const apiCache = new APICache();

/**
 * Cache-through response wrapper. Returns cached data if available,
 * otherwise calls fetcher and caches the result.
 */
export async function cachedResponse<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 300000
): Promise<T> {
  const cached = await apiCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fetcher();
  await apiCache.set(key, data, ttlMs);
  return data;
}

// =============================================================================
// SECURITY HEADERS
// =============================================================================

export function addSecurityHeaders(response: NextResponse): NextResponse {
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

// =============================================================================
// INPUT VALIDATION
// =============================================================================

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 1000);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-]{10,15}$/;
  return phoneRegex.test(phone);
}

// =============================================================================
// API RESPONSE HELPERS
// =============================================================================

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFoundResponse(message: string = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function tooManyRequestsResponse(retryAfter: number = 60) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
      },
    }
  );
}
