import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryCache } from '@/src/lib/cache/memoryCache';
import { errorLogger } from '@/lib/monitoring/errorLogger';
import { telemetry } from '@/lib/monitoring/errorSystem';

vi.mock('@/lib/monitoring/error-logger', () => ({ errorLogger: { error: vi.fn() } }));
vi.mock('@/lib/monitoring/error-system', () => ({ telemetry: { recordError: vi.fn() } }));

describe('MemoryCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('stores and retrieves values within ttl', () => {
    const cache = new MemoryCache<string, number>({ ttl: 1000 });
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);
  });

  it('expires values after ttl', async () => {
    vi.useFakeTimers();
    const cache = new MemoryCache<string, number>({ ttl: 100 });
    cache.set('a', 1);
    vi.advanceTimersByTime(150);
    expect(cache.get('a')).toBeUndefined();
    vi.useRealTimers();
  });

  it('limits cache size', () => {
    const cache = new MemoryCache<string, number>({ maxSize: 2 });
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
  });

  it('deduplicates concurrent fetches', async () => {
    const cache = new MemoryCache<string, number>({ ttl: 1000 });
    const fetcher = vi.fn().mockResolvedValue(5);

    const p1 = cache.getOrCreate('a', fetcher);
    const p2 = cache.getOrCreate('a', fetcher);
    const [v1, v2] = await Promise.all([p1, p2]);

    expect(v1).toBe(5);
    expect(v2).toBe(5);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('returns stale value while revalidating on error', async () => {
    vi.useFakeTimers();
    const cache = new MemoryCache<string, number>({ ttl: 100, staleTtl: 200 });
    const fetcher = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(2);

    cache.set('a', 1, 100);
    vi.advanceTimersByTime(150); // entry is stale
    const p1 = cache.getOrCreate('a', fetcher);
    expect(cache.get('a')).toBe(1); // stale value returned immediately
    await p1; // wait for background fetch
    vi.advanceTimersByTime(10);
    expect(errorLogger.error).toHaveBeenCalled();
    expect(telemetry.recordError).toHaveBeenCalled();
    // next attempt should return refreshed value
    const val = await cache.getOrCreate('a', fetcher);
    expect(val).toBe(2);
    vi.useRealTimers();
  });

  it('invalidates after repeated errors', async () => {
    const cache = new MemoryCache<string, number>({ ttl: 50, staleTtl: 50, errorThreshold: 2 });
    const fetcher = vi.fn().mockRejectedValue(new Error('oops'));

    cache.set('x', 1, 50);
    await expect(cache.getOrCreate('x', fetcher)).resolves.toBe(1); // stale
    await expect(cache.getOrCreate('x', fetcher)).resolves.toBe(1);
    expect(cache.get('x')).toBeUndefined();
  });

  it('deleteWhere removes matching keys', () => {
    const cache = new MemoryCache<string, number>({ ttl: 1000 });
    cache.set('a:1', 1);
    cache.set('b:1', 2);
    cache.deleteWhere(k => k.startsWith('a'));
    expect(cache.get('a:1')).toBeUndefined();
    expect(cache.get('b:1')).toBe(2);
  });
});
