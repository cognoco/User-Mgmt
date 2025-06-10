import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOptimistic } from '@/hooks/useOptimistic';

describe('useOptimistic', () => {
  it('updates optimistically and rolls back on failure', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useOptimistic(0));
    await act(async () => {
      await result.current.run(fn, 1);
    });
    expect(result.current.data).toBe(0);
  });

  it('queues actions when offline', async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false);
    const { result } = renderHook(() => useOptimistic(0));
    await act(async () => {
      await result.current.run(fn, 2);
    });
    expect(result.current.data).toBe(2);
    expect(result.current.queueLength).toBe(1);
  });

  it('flushes queue when online', async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false);
    const { result } = renderHook(() => useOptimistic(0));
    await act(async () => {
      await result.current.run(fn, 3);
    });
    expect(result.current.queueLength).toBe(1);
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    await act(async () => {
      await result.current.flushQueue();
    });
    expect(result.current.queueLength).toBe(0);
  });
});
