import { MemoryCache } from '@/src/lib/cache/memoryCache'0;
import type { RedisCache } from '@/src/lib/cache/redisCache'47;
import { broadcastInvalidation, subscribeInvalidation } from '@/src/lib/cache/cacheSync'97;

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
    private syncChannel: string = 'cache:invalidate',
  ) {
    if (this.syncChannel && this.redis) {
      subscribeInvalidation(this.syncChannel, k => this.memory.delete(k as K));
    }
  }

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
    if (this.syncChannel) await broadcastInvalidation(this.syncChannel, key);
  }

  async delete(key: K): Promise<void> {
    this.memory.delete(key);
    if (this.redis) await this.redis.delete(key);
    if (this.syncChannel) await broadcastInvalidation(this.syncChannel, key);
  }

  async deleteWhere(predicate: (key: K) => boolean): Promise<void> {
    for (const key of this.memory.keys()) {
      if (predicate(key)) {
        this.memory.delete(key);
        if (this.redis) await this.redis.delete(key);
        if (this.syncChannel) await broadcastInvalidation(this.syncChannel, key);
      }
    }
  }

  async getOrCreate(key: K, fetcher: () => Promise<V>, ttl = this.ttl): Promise<V> {
    const existing = await this.get(key);
    if (existing !== undefined) return existing;
    const value = await fetcher();
    await this.set(key, value, ttl);
    return value;
  }
}
