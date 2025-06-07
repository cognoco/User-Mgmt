import { errorLogger } from '@/lib/monitoring/errorLogger';
import { telemetry } from '@/lib/monitoring/errorSystem';

export interface MemoryCacheEntry<V> {
  value: V;
  expires: number;
  staleUntil: number;
}

export interface MemoryCacheOptions {
  ttl?: number; // milliseconds
  maxSize?: number; // maximum number of entries
  staleTtl?: number; // how long stale values are served
  errorThreshold?: number; // errors before invalidation
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
  private staleTtl: number;
  private errorThreshold: number;
  private errorCounts = new Map<K, number>();

  constructor(options: MemoryCacheOptions = {}) {
    this.ttl = options.ttl ?? 60_000; // default 60s
    this.maxSize = options.maxSize ?? 100;
    this.staleTtl = options.staleTtl ?? 0;
    this.errorThreshold = options.errorThreshold ?? 3;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    const now = Date.now();
    if (entry.expires < now) {
      if (entry.staleUntil > now) {
        return entry.value;
      }
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V, ttl: number = this.ttl): void {
    const now = Date.now();
    this.cache.set(key, {
      value,
      expires: now + ttl,
      staleUntil: now + ttl + this.staleTtl,
    });
    this.errorCounts.delete(key);
    this.prune();
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  deleteWhere(predicate: (key: K) => boolean): void {
    for (const key of this.cache.keys()) {
      if (predicate(key)) {
        this.cache.delete(key);
      }
    }
  }

  async getOrCreate(key: K, fetcher: () => Promise<V>, ttl: number = this.ttl): Promise<V> {
    const now = Date.now();
    const entry = this.cache.get(key);
    if (entry) {
      if (entry.expires > now) {
        return entry.value;
      }
      if (entry.staleUntil > now) {
        if (!this.inProgress.has(key)) {
          const promise = fetcher()
            .then(v => {
              this.set(key, v, ttl);
              this.inProgress.delete(key);
              return v;
            })
            .catch(err => {
              this.inProgress.delete(key);
              const cnt = (this.errorCounts.get(key) || 0) + 1;
              this.errorCounts.set(key, cnt);
              errorLogger.error('Cache fetch error', { key: String(key), err });
              telemetry.recordError({ type: 'CACHE_FETCH_ERROR', message: String(err) });
              if (cnt >= this.errorThreshold) {
                this.delete(key);
              }
              return entry.value;
            });
          this.inProgress.set(key, promise);
        }
        return entry.value;
      }
      this.cache.delete(key);
    }

    if (this.inProgress.has(key)) {
      return this.inProgress.get(key)!;
    }

    const promise = fetcher()
      .then(result => {
        this.set(key, result, ttl);
        this.inProgress.delete(key);
        return result;
      })
      .catch(err => {
        this.inProgress.delete(key);
        const cnt = (this.errorCounts.get(key) || 0) + 1;
        this.errorCounts.set(key, cnt);
        errorLogger.error('Cache fetch error', { key: String(key), err });
        telemetry.recordError({ type: 'CACHE_FETCH_ERROR', message: String(err) });
        if (cnt >= this.errorThreshold) {
          this.delete(key);
        }
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
