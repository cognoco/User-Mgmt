import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryCache, MultiLevelCache, RedisCache } from '@/lib/cache';
import * as sync from '@/lib/cache/cacheSync';

vi.mock('@/lib/cache/cache-sync', () => ({
  broadcastInvalidation: vi.fn(),
  subscribeInvalidation: vi.fn(),
}));
import { Redis } from '@upstash/redis';

vi.mock('@upstash/redis', () => ({ Redis: vi.fn(() => ({ get: vi.fn(), set: vi.fn(), del: vi.fn() })) }));

describe('MultiLevelCache', () => {
  let redis: any;
  let redisCache: RedisCache<number>;
  let memory: MemoryCache<string, number>;
  let cache: MultiLevelCache<string, number>;

  beforeEach(() => {
    redis = new Redis({ url: 'test', token: 'test' });
    redis.get.mockResolvedValue(null);
    redisCache = new RedisCache<number>(redis, { prefix: 'test:' });
    memory = new MemoryCache({ ttl: 1000 });
    cache = new MultiLevelCache(memory, redisCache, 1000, 'chan');
    vi.clearAllMocks();
  });

  it('returns value from redis when memory empty', async () => {
    redis.get.mockResolvedValue('1');
    const val = await cache.get('a');
    expect(val).toBe(1);
    expect(cache.metrics.hits).toBe(1);
  });

  it('subscribes to invalidation channel', () => {
    expect(sync.subscribeInvalidation).toHaveBeenCalledWith('chan', expect.any(Function));
  });

  it('stores value in both caches', async () => {
    await cache.set('b', 2, 500);
    expect(memory.get('b')).toBe(2);
    expect(redis.set).toHaveBeenCalled();
    expect(sync.broadcastInvalidation).toHaveBeenCalledWith('chan', 'b');
  });

  it('deletes value from both caches', async () => {
    await cache.set('c', 3);
    await cache.delete('c');
    expect(memory.get('c')).toBeUndefined();
    expect(redis.del).toHaveBeenCalled();
    expect(sync.broadcastInvalidation).toHaveBeenCalledWith('chan', 'c');
  });

  it('deleteWhere broadcasts for each key', async () => {
    await cache.set('a:1', 1);
    await cache.set('b:1', 2);
    await cache.deleteWhere(k => k.startsWith('a'));
    expect(sync.broadcastInvalidation).toHaveBeenCalledWith('chan', 'a:1');
  });
});
