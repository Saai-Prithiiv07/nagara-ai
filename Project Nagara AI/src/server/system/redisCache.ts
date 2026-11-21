/**
 * System & Integration: Caching with Redis
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Cache-Aside Pattern (Lazy Loading)
 * - Time-To-Live (TTL) cache eviction
 * - Cache Invalidation on data mutation
 * - Sub-millisecond read access for high-demand municipal GIS queries
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class RedisCacheService {
  private store = new Map<string, CacheEntry<unknown>>();
  private hitCount = 0;
  private missCount = 0;

  /**
   * Retrieves a cached value, automatically expiring stale keys.
   */
  public async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) {
      this.missCount++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return entry.value as T;
  }

  /**
   * Sets a value in the cache with a specified TTL in seconds.
   */
  public async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Invalidates a single key or pattern of keys (e.g., when budget is modified).
   */
  public async del(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  /**
   * Cache-Aside Wrapper: Checks cache first; on miss, invokes computeFunction and caches result.
   */
  public async getOrCompute<T>(
    key: string,
    ttlSeconds: number,
    computeFunction: () => Promise<T>
  ): Promise<{ data: T; source: 'cache' | 'compute' }> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return { data: cached, source: 'cache' };
    }

    const computed = await computeFunction();
    await this.set(key, computed, ttlSeconds);
    return { data: computed, source: 'compute' };
  }

  public getMetrics() {
    const total = this.hitCount + this.missCount;
    const hitRatio = total > 0 ? Number((this.hitCount / total).toFixed(2)) : 0;
    return {
      hits: this.hitCount,
      misses: this.missCount,
      hitRatio,
      cachedKeysCount: this.store.size,
    };
  }

  public clear(): void {
    this.store.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
}

export const redisCache = new RedisCacheService();
