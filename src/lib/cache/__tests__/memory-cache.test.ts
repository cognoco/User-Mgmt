import { describe, it, expect, vi } from 'vitest';
import { MemoryCache } from '../memory-cache';

describe('MemoryCache', () => {
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
});
