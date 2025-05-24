import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApiKeys } from '../useApiKeys';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

  const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useApiKeys', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches API keys', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ keys: [{ id: '1', name: 'Key 1' }] }),
    });
    const { result } = renderHook(() => useApiKeys(), { wrapper });
    await waitFor(() => {
      expect(result.current.apiKeys).toEqual([{ id: '1', name: 'Key 1' }]);
    });
  });

  it('creates an API key', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ keys: [] }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: '2', name: 'Key 2' }) });

    const { result } = renderHook(() => useApiKeys(), { wrapper });

    await act(async () => {
      const res = await result.current.createApiKey.mutateAsync({ name: 'Key 2' });
      expect(res).toEqual({ id: '2', name: 'Key 2' });
    });
  });

  it('revokes an API key', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ keys: [] }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ message: 'API key revoked successfully' }) });

    const { result } = renderHook(() => useApiKeys(), { wrapper });

    await act(async () => {
      const res = await result.current.revokeApiKey.mutateAsync('1');
      expect(res).toEqual({ message: 'API key revoked successfully' });
    });
  });
}); 