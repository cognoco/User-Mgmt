import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWebhooks } from '../useWebhooks';

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

describe('useWebhooks', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches webhooks', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ webhooks: [{ id: '1', name: 'Webhook 1' }] }),
    });

    const { result } = renderHook(() => useWebhooks(), { wrapper });

    await waitFor(() => result.current.webhooks !== undefined);
    expect(result.current.webhooks).toEqual([{ id: '1', name: 'Webhook 1' }]);
  });

  it('creates a webhook', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '2', name: 'Webhook 2' }),
    });

    const { result } = renderHook(() => useWebhooks(), { wrapper });

    await act(async () => {
      const res = await result.current.createWebhook.mutateAsync({
        name: 'Webhook 2',
        url: 'https://example.com',
        events: [],
      });
      expect(res).toEqual({ id: '2', name: 'Webhook 2' });
    });
  });

  it('deletes a webhook', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => useWebhooks(), { wrapper });

    await act(async () => {
      const res = await result.current.deleteWebhook.mutateAsync('1');
      expect(res).toEqual({ success: true });
    });
  });
});
