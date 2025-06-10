import { describe, it, expect, vi } from 'vitest';
import { RefreshManager } from '@/utils/refreshManager';

describe('RefreshManager', () => {
  it('invokes callback on interval', () => {
    vi.useFakeTimers();
    const manager = new RefreshManager(100);
    const cb = vi.fn();
    manager.startRefresh('a', async () => cb());
    vi.advanceTimersByTime(350);
    expect(cb).toHaveBeenCalledTimes(3);
    manager.stopRefresh('a');
    vi.advanceTimersByTime(200);
    expect(cb).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });
});
