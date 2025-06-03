import { MemoryCache } from './memory-cache';
import type { RedisCache } from './redis-cache';

export interface MultiLevelCacheMetrics {
  hits: number;
  misses: number;
}

export class MultiLevelCache<K extends string, V> {
  metrics: MultiLevelCacheMetrics = { hits: 0, misses: 0 };
  constructor(
    private memory: MemoryCache<K, V>,
    private redis?: RedisCache<V>,
    private ttl?: number,
  ) {}

  async get(key: K): Promise<V | undefined> {
    const mem = this.memory.get(key);
    if (mem !== undefined) {
      this.metrics.hits++;
      return mem;
    }
    if (this.redis) {
      const val = await this.redis.get(key);
      if (val !== undefined) {
        this.metrics.hits++;
        this.memory.set(key, val, this.ttl);
        return val;
      }
    }
    this.metrics.misses++;
    return undefined;
  }

  async set(key: K, value: V, ttl = this.ttl): Promise<void> {
    this.memory.set(key, value, ttl);
    if (this.redis) await this.redis.set(key, value, ttl);
  }

  async delete(key: K): Promise<void> {
    this.memory.delete(key);
    if (this.redis) await this.redis.delete(key);
  }

  async getOrCreate(key: K, fetcher: () => Promise<V>, ttl = this.ttl): Promise<V> {
    const existing = await this.get(key);
    if (existing !== undefined) return existing;
    const value = await fetcher();
    await this.set(key, value, ttl);
    return value;
  }
}
