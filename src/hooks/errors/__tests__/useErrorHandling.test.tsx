import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useErrorHandling } from '@/hooks/errors/useErrorHandling';

describe('useErrorHandling', () => {
  it('handles errors and clears them', () => {
    const { result } = renderHook(() => useErrorHandling());
    act(() => {
      result.current.handleError(new Error('oops'));
    });
    expect(result.current.error?.message).toBe('oops');
    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it('retries with exponential backoff', async () => {
    vi.useFakeTimers();
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue(undefined);
    const { result } = renderHook(() => useErrorHandling({ retryFn: fn }));
    const promise = act(async () => {
      const p = result.current.retry();
      vi.runAllTimers();
      await p;
    });
    await promise;
    expect(fn).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
    vi.useRealTimers();
  });
});
