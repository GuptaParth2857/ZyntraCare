/**
 * Higher-Level Caching Utilities for ZyntraCare
 *
 * Provides cache-through pattern, pattern-based invalidation, and API route
 * middleware. Uses Redis when available, falls back to in-memory storage.
 */

import { getRedisClient, createKey, createPattern } from './redis';
import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// TYPES
// =============================================================================

interface CacheOptions {
  /** Time-to-live in seconds. Default: 300 (5 minutes) */
  ttl?: number;
  /** Namespace prefix for the cache key */
  namespace?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

// =============================================================================
// IN-MEMORY FALLBACK (used when Redis is unavailable)
// =============================================================================

const memoryStore = new Map<string, CacheEntry<any>>();
let memoryCleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureMemoryCleanup(): void {
  if (memoryCleanupInterval) return;
  memoryCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore) {
      if (now - entry.timestamp > entry.ttlMs) {
        memoryStore.delete(key);
      }
    }
  }, 60000);
}

// =============================================================================
// CACHE-THROUGH PATTERN
// =============================================================================

/**
 * Cache-through pattern: returns cached data if available, otherwise calls
 * the fetcher, caches the result, and returns it.
 *
 * @param key - Cache key (will be namespaced with `zyntracare:` prefix)
 * @param fetcher - Async function that fetches fresh data on cache miss
 * @param options - Cache options (ttl, namespace)
 * @returns The cached or freshly fetched data
 *
 * @example
 * ```ts
 * const hospitals = await getCache('hospitals:active', () => db.hospital.findMany(), { ttl: 600 });
 * ```
 */
export async function getCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = 300, namespace } = options;
  const fullKey = namespace ? createKey(namespace, key) : key;
  const ttlMs = ttl * 1000;

  // Try Redis first
  const redis = await getRedisClient();
  const cached = await redis.get(fullKey);

  if (cached !== null) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      // Corrupted cache entry — treat as miss
      await redis.del(fullKey);
    }
  }

  // Cache miss — call fetcher
  const data = await fetcher();

  // Cache the result
  try {
    await redis.set(fullKey, JSON.stringify(data), ttl);
  } catch {
    // If Redis write fails, try in-memory fallback
    memoryStore.set(fullKey, { data, timestamp: Date.now(), ttlMs });
    ensureMemoryCleanup();
  }

  return data;
}

/**
 * Get a cached value directly (without a fetcher).
 * Returns null on cache miss.
 */
export async function getCacheValue<T>(key: string, namespace?: string): Promise<T | null> {
  const fullKey = namespace ? createKey(namespace, key) : key;
  const redis = await getRedisClient();
  const cached = await redis.get(fullKey);
  if (!cached) return null;
  try {
    return JSON.parse(cached) as T;
  } catch {
    return null;
  }
}

/**
 * Set a cache value directly.
 */
export async function setCacheValue<T>(
  key: string,
  value: T,
  ttl: number = 300,
  namespace?: string
): Promise<void> {
  const fullKey = namespace ? createKey(namespace, key) : key;
  const redis = await getRedisClient();
  try {
    await redis.set(fullKey, JSON.stringify(value), ttl);
  } catch {
    const ttlMs = ttl * 1000;
    memoryStore.set(fullKey, { data: value, timestamp: Date.now(), ttlMs });
    ensureMemoryCleanup();
  }
}

// =============================================================================
// PATTERN-BASED CACHE INVALIDATION
// =============================================================================

/**
 * Invalidate all cache entries matching a pattern.
 *
 * @param pattern - Glob-like pattern (e.g., "hospitals:*" or "doctors:hospital:123:*")
 *
 * @example
 * ```ts
 * // Invalidate all hospital caches
 * await invalidateCache('hospitals:*');
 *
 * // Invalidate caches for a specific hospital
 * await invalidateCache('doctors:hospital:123:*');
 * ```
 */
export async function invalidateCache(pattern: string): Promise<number> {
  const redis = await getRedisClient();
  let deletedCount = 0;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      deletedCount = keys.length;
    }
  } catch {
    // Fallback: scan in-memory store
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    for (const [key] of memoryStore) {
      if (regex.test(key)) {
        memoryStore.delete(key);
        deletedCount++;
      }
    }
  }

  return deletedCount;
}

/**
 * Clear all cache entries (use with caution).
 */
export async function clearAllCache(): Promise<void> {
  const redis = await getRedisClient();
  try {
    const keys = await redis.keys('*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    memoryStore.clear();
  }
}

// =============================================================================
// API ROUTE CACHE MIDDLEWARE
// =============================================================================

/**
 * Cache middleware for Next.js API route handlers.
 * Wraps a handler and caches responses based on a key function.
 *
 * @param handler - The original API route handler
 * @param keyFn - Function that generates a cache key from the request
 * @param ttl - Time-to-live in seconds (default: 300)
 * @returns Wrapped handler with caching
 *
 * @example
 * ```ts
 * export const GET = cacheMiddleware(
 *   async (req: NextRequest) => {
 *     const hospitals = await db.hospital.findMany();
 *     return NextResponse.json(hospitals);
 *   },
 *   (req) => `hospitals:list:${req.nextUrl.searchParams.toString()}`,
 *   600
 * );
 * ```
 */
export function cacheMiddleware<T = any>(
  handler: (req: NextRequest) => Promise<NextResponse>,
  keyFn: (req: NextRequest) => string,
  ttl: number = 300
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return handler(req);
    }

    const cacheKey = keyFn(req);
    const redis = await getRedisClient();

    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      try {
        const parsed = JSON.parse(cached);
        return NextResponse.json(parsed.data, {
          headers: {
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey,
          },
        });
      } catch {
        // Corrupted — treat as miss
        await redis.del(cacheKey);
      }
    }

    // Cache miss — execute handler
    const response = await handler(req);

    // Only cache successful responses
    if (response.status >= 200 && response.status < 300) {
      try {
        const body = await response.clone().json();
        await redis.set(cacheKey, JSON.stringify({ data: body }), ttl);
      } catch {
        // Don't fail the request if caching fails
      }
    }

    // Clone response to add cache headers
    const cachedResponse = NextResponse.json(
      await response.clone().json(),
      {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey,
        },
      }
    );

    return cachedResponse;
  };
}

// =============================================================================
// CONVENIENCE CACHING HELPERS
// =============================================================================

/**
 * Cache hospital data with automatic invalidation support.
 */
export async function cacheHospital<T>(
  hospitalId: string,
  fetcher: () => Promise<T>,
  ttl: number = 600
): Promise<T> {
  return getCache(`hospitals:${hospitalId}`, fetcher, { ttl, namespace: 'zyntracare' });
}

/**
 * Cache doctor data with automatic invalidation support.
 */
export async function cacheDoctor<T>(
  doctorId: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  return getCache(`doctors:${doctorId}`, fetcher, { ttl, namespace: 'zyntracare' });
}

/**
 * Cache lab data with automatic invalidation support.
 */
export async function cacheLab<T>(
  labId: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  return getCache(`labs:${labId}`, fetcher, { ttl, namespace: 'zyntracare' });
}

/**
 * Invalidate all caches for a specific hospital.
 */
export async function invalidateHospitalCache(hospitalId: string): Promise<number> {
  return invalidateCache(createPattern(createKey('zyntracare', 'hospitals', hospitalId)));
}

/**
 * Invalidate all caches for a specific doctor.
 */
export async function invalidateDoctorCache(doctorId: string): Promise<number> {
  return invalidateCache(createPattern(createKey('zyntracare', 'doctors', doctorId)));
}

/**
 * Invalidate all caches for a specific lab.
 */
export async function invalidateLabCache(labId: string): Promise<number> {
  return invalidateCache(createPattern(createKey('zyntracare', 'labs', labId)));
}

// =============================================================================
// CACHE STATS
// =============================================================================

/**
 * Get cache statistics for monitoring.
 */
export async function getCacheStats(): Promise<{
  redisConnected: boolean;
  memoryKeys: number;
}> {
  const redis = await getRedisClient();
  return {
    redisConnected: redis.isConnected(),
    memoryKeys: memoryStore.size,
  };
}
