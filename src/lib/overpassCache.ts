// Shared server-side TTL cache for expensive external API calls (Overpass, etc.)
// Prevents rate-limit (429/504) when many users request the same area simultaneously.

type CachedEntry = {
  value: unknown;
  expiresAt: number;
};

const store = new Map<string, CachedEntry>();

// Round area to a grid so nearby requests share the same cache key
export function areaKey(lat: number, lng: number, radius: number): string {
  const cell = Math.max(0.01, radius / 1000); // km -> degree-ish
  const llat = (Math.round(lat / cell) * cell).toFixed(3);
  const llng = (Math.round(lng / cell) * cell).toFixed(3);
  return `${llat},${llng},${radius}`;
}

export async function cachedFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }

  const value = await fetcher();

  // Only cache successful, non-empty results to avoid poisoning the cache
  const isEmpty =
    value &&
    typeof value === 'object' &&
    (value as { length?: number; count?: number }).length === 0;

  if (value !== undefined && value !== null && !isEmpty) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  return value;
}

// Limit how much the cache can grow so memory stays bounded under heavy load
export function pruneCache(maxEntries = 500) {
  if (store.size <= maxEntries) return;
  const now = Date.now();
  for (const [k, v] of store) {
    if (v.expiresAt < now) store.delete(k);
  }
  if (store.size <= maxEntries) return;
  // Remove oldest by expiresAt if still too big
  const sorted = [...store.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt);
  const excess = store.size - maxEntries;
  for (let i = 0; i < excess; i++) store.delete(sorted[i][0]);
}
