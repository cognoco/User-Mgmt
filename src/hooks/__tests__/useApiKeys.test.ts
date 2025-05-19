import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import * as React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { useApiKeys } from '../useApiKeys';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useApiKeys', () => {
  it('fetches API keys', async () => {
    server.use(
      rest.get(
        '/api/api-keys',
        (_req: any, res: any, ctx: any) =>
          res(ctx.json({ keys: [{ id: '1', name: 'Key 1' }] }))
      )
    );
    const { result } = renderHook(() => useApiKeys(), { wrapper });
    await waitFor(() => result.current.apiKeys !== undefined);
    expect(result.current.apiKeys).toEqual([{ id: '1', name: 'Key 1' }]);
  });

  it('creates an API key', async () => {
    server.use(
      rest.post(
        '/api/api-keys',
        (_req: any, res: any, ctx: any) =>
          res(ctx.json({ id: '2', name: 'Key 2' }))
      )
    );
    const { result } = renderHook(() => useApiKeys(), { wrapper });
    await act(async () => {
      const res = await result.current.createApiKey.mutateAsync({ name: 'Key 2' });
      expect(res).toEqual({ id: '2', name: 'Key 2' });
    });
  });

  it('revokes an API key', async () => {
    server.use(
      rest.delete(
        '/api/api-keys/1',
        (_req: any, res: any, ctx: any) =>
          res(ctx.json({ message: 'API key revoked successfully' }))
      )
    );
    const { result } = renderHook(() => useApiKeys(), { wrapper });
    await act(async () => {
      const res = await result.current.revokeApiKey.mutateAsync('1');
      expect(res).toEqual({ message: 'API key revoked successfully' });
    });
  });
}); 