import { describe, it, expect, vi } from 'vitest';
import { SearchCache } from '@/utils/cache/searchCache';

describe('SearchCache', () => {
  it('stores and retrieves items', () => {
    const cache = new SearchCache<number>(1000);
    const key = cache.generateKey({ a: 1 });
    cache.set(key, 5);
    expect(cache.get(key)).toBe(5);
  });

  it('expires items', () => {
    vi.useFakeTimers();
    const cache = new SearchCache<number>(100);
    const key = cache.generateKey({ a: 1 });
    cache.set(key, 1);
    vi.advanceTimersByTime(150);
    expect(cache.get(key)).toBeNull();
    vi.useRealTimers();
  });

  it('invalidateWhere removes matching keys', () => {
    const cache = new SearchCache<number>();
    const k1 = cache.generateKey({ a: 1 });
    const k2 = cache.generateKey({ b: 2 });
    cache.set(k1, 1);
    cache.set(k2, 2);
    cache.invalidateWhere((k) => k.includes('a'));
    expect(cache.get(k1)).toBeNull();
    expect(cache.get(k2)).toBe(2);
  });
});
