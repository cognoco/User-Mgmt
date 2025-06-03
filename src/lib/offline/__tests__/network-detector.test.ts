import { describe, it, expect, vi, afterEach } from 'vitest';
import { detectNetworkStatus } from '../network-detector';

describe('detectNetworkStatus', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    // reset fetch
    // @ts-ignore
    delete global.fetch;
    delete (window.navigator as any).onLine;
  });

  it('returns true when navigator is online', async () => {
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => true });
    expect(await detectNetworkStatus()).toBe(true);
  });

  it('returns false when offline and ping fails', async () => {
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => false });
    global.fetch = vi.fn().mockRejectedValue(new Error('fail')) as any;
    expect(await detectNetworkStatus()).toBe(false);
  });
});
