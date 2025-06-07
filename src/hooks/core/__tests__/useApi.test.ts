// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useApi } from '@/hooks/core/useApi';

describe('useApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetchApi returns data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { ok: true } })
    }) as any;
    const { result } = renderHook(() => useApi());
    let data: any;
    await act(async () => {
      data = await result.current.fetchApi('/test');
    });
    expect(global.fetch).toHaveBeenCalledWith('/test', undefined);
    expect(data).toEqual({ ok: true });
    expect(result.current.error).toBeNull();
  });

  it('apiPost handles error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Bad',
      json: () => Promise.resolve({})
    }) as any;
    const { result } = renderHook(() => useApi());
    let res: any;
    await act(async () => {
      res = await result.current.apiPost('/test', { a: 1 });
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/test',
      expect.objectContaining({ method: 'POST' })
    );
    expect(res).toBeNull();
    expect(result.current.error).toBe('Bad');
  });
});
