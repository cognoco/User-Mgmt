import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCsrf } from '@/hooks/csrf/useCsrf';
import { CsrfProvider } from '@/ui/headless/csrf/CsrfProvider';
import type { CsrfService } from '@/core/csrf/interfaces';

function createWrapper(service: CsrfService) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <CsrfProvider csrfService={service}>{children}</CsrfProvider>
  );
  Wrapper.displayName = 'CsrfTestWrapper';
  return Wrapper;
}

describe('useCsrf', () => {
  it('fetches token on mount', async () => {
    const service: CsrfService = { generateToken: vi.fn(async () => ({ token: 'tok' })) };
    const { result } = renderHook(() => useCsrf(), { wrapper: createWrapper(service) });

    await act(async () => {
      await Promise.resolve();
    });

    expect(service.generateToken).toHaveBeenCalled();
    expect(result.current.token).toBe('tok');
    expect(result.current.error).toBeNull();
  });

  it('handles errors', async () => {
    const service: CsrfService = { generateToken: vi.fn(async () => { throw new Error('fail'); }) };
    const { result } = renderHook(() => useCsrf(), { wrapper: createWrapper(service) });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.error).toBe('fail');
  });

  it('validates token', async () => {
    const service: CsrfService = { generateToken: vi.fn(async () => ({ token: 'abc' })) };
    const { result } = renderHook(() => useCsrf(), { wrapper: createWrapper(service) });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.validateToken('abc')).toBe(true);
    expect(result.current.validateToken('xyz')).toBe(false);
  });
});
