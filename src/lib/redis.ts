/**
 * Redis Client for ZyntraCare Distributed Production
 *
 * Provides lazy-initialized Redis connection with graceful fallback to
 * in-memory Map when Redis is unavailable. Uses `ioredis` if installed,
 * otherwise falls back seamlessly.
 *
 * Add ioredis as a dependency: npm install ioredis
 */

// =============================================================================
// TYPES
// =============================================================================

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(...keys: string[]): Promise<void>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttlSeconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

// =============================================================================
// IN-MEMORY FALLBACK
// =============================================================================

class InMemoryRedis implements RedisClient {
  private store = new Map<string, { value: string; expiresAt?: number }>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async del(...keys: string[]): Promise<void> {
    for (const key of keys) {
      this.store.delete(key);
    }
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const entry = this.store.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
  }

  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return -2;
    if (!entry.expiresAt) return -1;
    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    if (remaining <= 0) {
      this.store.delete(key);
      return -2;
    }
    return remaining;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    const now = Date.now();
    const result: string[] = [];
    for (const [key, entry] of this.store) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.store.delete(key);
        continue;
      }
      if (regex.test(key)) {
        result.push(key);
      }
    }
    return result;
  }

  async disconnect(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }

  isConnected(): boolean {
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// =============================================================================
// IOREDIS CLIENT WRAPPER
// =============================================================================

class IORedisClient implements RedisClient {
  private client: any = null;
  private connected = false;
  private prefix: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  async connect(url: string): Promise<void> {
    try {
      // Dynamic import of ioredis — must be installed separately
      // npm install ioredis
      let RedisClass: any;
      try {
        const mod = await import('ioredis');
        RedisClass = mod.default || mod;
      } catch {
        console.warn('[Redis] ioredis not installed, using in-memory fallback');
        this.connected = false;
        return;
      }

      this.client = new RedisClass(url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
          if (times > 10) return null;
          return Math.min(times * 200, 5000);
        },
        lazyConnect: true,
        enableReadyCheck: true,
        connectTimeout: 5000,
        commandTimeout: 3000,
      });

      this.client.on('connect', () => {
        this.connected = true;
        this.reconnectAttempts = 0;
      });

      this.client.on('error', (err: Error) => {
        this.connected = false;
        console.error('[Redis] Connection error:', err.message);
      });

      this.client.on('close', () => {
        this.connected = false;
      });

      this.client.on('reconnecting', () => {
        this.reconnectAttempts++;
        if (this.reconnectAttempts > this.maxReconnectAttempts) {
          console.error('[Redis] Max reconnect attempts reached, falling back to in-memory');
          this.client?.disconnect();
          this.client = null;
        }
      });

      await this.client.connect();
      this.connected = true;
    } catch (err) {
      this.connected = false;
      console.error('[Redis] Failed to initialize:', (err as Error).message);
      throw err;
    }
  }

  private prefixKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get(key: string): Promise<string | null> {
    if (!this.connected || !this.client) return null;
    try {
      return await this.client.get(this.prefixKey(key));
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      const prefixed = this.prefixKey(key);
      if (ttlSeconds) {
        await this.client.setex(prefixed, ttlSeconds, value);
      } else {
        await this.client.set(prefixed, value);
      }
    } catch {
      // Silently fail — caller should handle via fallback
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      const prefixed = keys.map(k => this.prefixKey(k));
      await this.client.del(...prefixed);
    } catch {
      // Silently fail
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.connected || !this.client) return false;
    try {
      const result = await this.client.exists(this.prefixKey(key));
      return result === 1;
    } catch {
      return false;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      await this.client.expire(this.prefixKey(key), ttlSeconds);
    } catch {
      // Silently fail
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.connected || !this.client) return -2;
    try {
      return await this.client.ttl(this.prefixKey(key));
    } catch {
      return -2;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.connected || !this.client) return [];
    try {
      const prefixed = this.prefixKey(pattern);
      const keys = await this.client.keys(prefixed);
      // Strip prefix from returned keys
      const prefixLen = this.prefix.length + 1;
      return keys.map((k: string) => k.substring(prefixLen));
    } catch {
      return [];
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
      this.client = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// =============================================================================
// REDIS CLIENT FACTORY
// =============================================================================

const PREFIX = 'zyntracare';
const REDIS_URL = process.env.REDIS_URL;

let redisClient: RedisClient | null = null;
let inMemoryFallback: InMemoryRedis | null = null;

/**
 * Initialize Redis client lazily. Returns Redis if REDIS_URL is set and
 * connection succeeds, otherwise returns in-memory fallback.
 */
async function initializeRedis(): Promise<RedisClient> {
  if (redisClient) return redisClient;

  if (!REDIS_URL) {
    console.log('[Redis] REDIS_URL not set, using in-memory fallback');
    inMemoryFallback = inMemoryFallback || new InMemoryRedis();
    redisClient = inMemoryFallback;
    return redisClient;
  }

  try {
    const client = new IORedisClient(PREFIX);
    await client.connect(REDIS_URL);
    redisClient = client;
    console.log('[Redis] Connected successfully');
    return redisClient;
  } catch (err) {
    console.warn('[Redis] Connection failed, falling back to in-memory:', (err as Error).message);
    inMemoryFallback = inMemoryFallback || new InMemoryRedis();
    redisClient = inMemoryFallback;
    return redisClient;
  }
}

/**
 * Get the Redis client instance. Lazy-connects on first call.
 * Falls back to in-memory Map if Redis is unavailable.
 */
export async function getRedisClient(): Promise<RedisClient> {
  return initializeRedis();
}

/**
 * Synchronous client accessor. Returns the cached instance if already
 * initialized, otherwise returns null. Use getRedisClient() for async init.
 */
export function getRedisClientSync(): RedisClient | null {
  return redisClient;
}

/**
 * Gracefully shutdown the Redis connection.
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }
  if (inMemoryFallback) {
    await inMemoryFallback.disconnect();
    inMemoryFallback = null;
  }
}

// =============================================================================
// NAMESPACED KEY HELPERS
// =============================================================================

/**
 * Create a namespaced cache key.
 * @example createKey('hospitals', '123') => 'hospitals:123'
 */
export function createKey(...parts: string[]): string {
  return parts.filter(Boolean).join(':');
}

/**
 * Create a pattern for wildcard cache invalidation.
 * @example createPattern('hospitals') => 'hospitals:*'
 */
export function createPattern(namespace: string): string {
  return `${namespace}:*`;
}

// Export singleton for direct access when already initialized
export const redis = {
  get client() {
    return getRedisClientSync();
  },
  get isReady() {
    return redisClient !== null && redisClient.isConnected();
  },
};
