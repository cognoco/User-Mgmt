import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryCache, MultiLevelCache, RedisCache } from '@/lib/cache';
import * as sync from '@/lib/cache/cacheSync';

vi.mock('@/lib/cache/cache-sync', () => ({
  broadcastInvalidation: vi.fn(),
  subscribeInvalidation: vi.fn(),
}));
import { Redis } from '@upstash/redis';

vi.mock('@upstash/redis', () => ({ Redis: vi.fn(() => ({ get: vi.fn(), set: vi.fn(), del: vi.fn() })) }));

describe('MultiLevelCache deleteWhere', () => {
  let redis: any;
  let cache: MultiLevelCache<string, number>;

  beforeEach(() => {
    redis = new Redis({ url: 'x', token: 'x' });
    const redisCache = new RedisCache<number>(redis, { prefix: 't:' });
    cache = new MultiLevelCache(new MemoryCache({ ttl: 1000 }), redisCache, 1000, 'ch');
    vi.clearAllMocks();
  });

  it('removes keys from both caches', async () => {
    await cache.set('a:1', 1);
    await cache.set('b:1', 2);
    await cache.deleteWhere(k => k.startsWith('a'));
    expect(await cache.get('a:1')).toBeUndefined();
    expect(await cache.get('b:1')).toBe(2);
    expect(redis.del).toHaveBeenCalled();
    expect(sync.broadcastInvalidation).toHaveBeenCalledWith('ch', 'a:1');
  });
});
