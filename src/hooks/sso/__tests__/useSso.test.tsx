import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SsoProvider } from '@/types/sso';
import { SsoProvider as SsoServiceProvider, SsoService } from '@/lib/context/SsoContext';
import { useSso } from '../useSso';

const mockService: SsoService = {
  listProviders: vi.fn(async () => [{ id: '1', name: 'Test', type: 'saml' }]),
  listConnections: vi.fn(async () => []),
  connect: vi.fn(async () => ({ id: 'c1', providerId: '1', providerName: 'Test', createdAt: '' })),
  disconnect: vi.fn(async () => {}),
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <SsoServiceProvider ssoService={mockService}>{children}</SsoServiceProvider>;
}

describe('useSso hook', () => {
  it('fetches providers', async () => {
    const { result } = renderHook(() => useSso(), { wrapper });
    await act(async () => {
      await result.current.fetchProviders();
    });
    expect(result.current.providers).toEqual([{ id: '1', name: 'Test', type: 'saml' }]);
  });

  it('handles errors', async () => {
    vi.mocked(mockService.listProviders).mockRejectedValueOnce(new Error('err'));
    const { result } = renderHook(() => useSso(), { wrapper });
    await act(async () => {
      await result.current.fetchProviders();
    });
    expect(result.current.error).toBe('err');
  });
});
