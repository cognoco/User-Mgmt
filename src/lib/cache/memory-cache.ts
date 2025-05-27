export interface MemoryCacheEntry<V> {
  value: V;
  expires: number;
}

export interface MemoryCacheOptions {
  ttl?: number; // milliseconds
  maxSize?: number; // maximum number of entries
}

/**
 * Simple in-memory cache with TTL and size limit. Designed for
 * high-frequency low-volatility data like user profiles or team structures.
 */
export class MemoryCache<K, V> {
  private cache = new Map<K, MemoryCacheEntry<V>>();
  private inProgress = new Map<K, Promise<V>>();
  private ttl: number;
  private maxSize: number;

  constructor(options: MemoryCacheOptions = {}) {
    this.ttl = options.ttl ?? 60_000; // default 60s
    this.maxSize = options.maxSize ?? 100;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V, ttl: number = this.ttl): void {
    this.cache.set(key, { value, expires: Date.now() + ttl });
    this.prune();
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  async getOrCreate(key: K, fetcher: () => Promise<V>, ttl: number = this.ttl): Promise<V> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    if (this.inProgress.has(key)) {
      return this.inProgress.get(key)!;
    }

    const promise = fetcher().then(result => {
      this.set(key, result, ttl);
      this.inProgress.delete(key);
      return result;
    }).catch(err => {
      this.inProgress.delete(key);
      throw err;
    });

    this.inProgress.set(key, promise);
    return promise;
  }

  private prune(): void {
    if (this.cache.size <= this.maxSize) return;
    const keys = this.cache.keys();
    while (this.cache.size > this.maxSize) {
      const k = keys.next().value;
      if (k !== undefined) this.cache.delete(k);
    }
  }
}
