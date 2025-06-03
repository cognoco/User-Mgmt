import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOfflineStatus } from '../useOfflineStatus';
import * as queueService from '@/lib/services/offline-queue.service';

describe('useOfflineStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // restore navigator.onLine if modified
    delete (navigator as any).onLine;
  });

  it('initializes based on navigator.onLine', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current.isOffline).toBe(true);
  });

  it('updates queue length when queue changes', () => {
    const listeners: ((n: number) => void)[] = [];
    vi.spyOn(queueService, 'subscribeToQueueUpdates').mockImplementation(cb => {
      listeners.push(cb);
    });
    vi.spyOn(queueService, 'unsubscribeFromQueueUpdates').mockImplementation(cb => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    });
    const { result } = renderHook(() => useOfflineStatus());
    act(() => listeners.forEach(l => l(2)));
    expect(result.current.queueLength).toBe(2);
  });

  it('processes queue when online and connectivity verified', async () => {
    vi.spyOn(queueService, 'verifyConnectivity').mockResolvedValue(true);
    const proc = vi.spyOn(queueService, 'processQueue').mockResolvedValue();
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const { result } = renderHook(() => useOfflineStatus());
    Object.defineProperty(navigator, 'onLine', { value: true });
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOffline).toBe(false);
    await waitFor(() => expect(proc).toHaveBeenCalled());
  });
});
