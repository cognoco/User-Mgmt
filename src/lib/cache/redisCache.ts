import type { Redis } from '@upstash/redis';

export interface RedisCacheOptions {
  prefix?: string;
}

export class RedisCache<V> {
  private prefix: string;
  constructor(private redis: Redis, options: RedisCacheOptions = {}) {
    this.prefix = options.prefix ?? 'um:';
  }
  private key(k: string) {
    return `${this.prefix}${k}`;
  }
  async get(key: string): Promise<V | undefined> {
    try {
      const raw = await this.redis.get(this.key(key));
      if (raw === null || raw === undefined) return undefined;
      return JSON.parse(String(raw)) as V;
    } catch {
      return undefined;
    }
  }
  async set(key: string, value: V, ttlMs?: number): Promise<void> {
    const stored = JSON.stringify(value);
    const opts = ttlMs ? { ex: Math.ceil(ttlMs / 1000) } : undefined;
    await this.redis.set(this.key(key), stored, opts as any);
  }
  async delete(key: string): Promise<void> {
    await this.redis.del(this.key(key));
  }
}
