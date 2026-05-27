import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
});

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCache<T>(key: string, value: T, ttlSeconds: number = 60): void {
  cache.set(key, value, ttlSeconds);
}

export function clearCache(pattern?: string): void {
  if (pattern) {
    const keys = cache.keys().filter(k => k.startsWith(pattern));
    keys.forEach(k => cache.del(k));
  } else {
    cache.flushAll();
  }
}

export function getCacheKeys(): string[] {
  return cache.keys();
}

export function getCacheStats() {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize,
  };
}

export { cache };
