import { renderHook, act, waitFor } from '@testing-library/react';
import { useSubscription } from '@/hooks/user/useSubscription';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestWrapper } from '@/tests/utils/testWrapper';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TestWrapper>{children}</TestWrapper>
);

describe('useSubscription', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.clearAllMocks();
  });

  it('should fetch subscription status successfully', async () => {
    const mockSubscription = {
      status: 'active',
      plan: 'premium',
      currentPeriodEnd: '2024-12-31',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSubscription),
    });

    const { result } = renderHook(() => useSubscription(), { wrapper });

    // On initial render, isLoading should be false
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await result.current.fetchSubscription();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.subscription).toEqual(mockSubscription);
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions/status');
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch subscription';
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useSubscription(), { wrapper });

    await act(async () => {
      await result.current.fetchSubscription();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should create checkout session', async () => {
    const mockUrl = 'https://checkout.stripe.com/session';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: mockUrl }),
    });

    const { result } = renderHook(() => useSubscription(), { wrapper });

    const windowSpy = vi.spyOn(window, 'location', 'get');
    const mockLocation = {
      assign: vi.fn(),
      ancestorOrigins: [] as any,
      hash: '',
      host: '',
      hostname: '',
      href: '',
      origin: '',
      pathname: '',
      port: '',
      protocol: '',
      search: '',
      reload: vi.fn(),
      replace: vi.fn(),
      toString: () => '',
    } as Location;
    windowSpy.mockReturnValue(mockLocation);

    await act(async () => {
      await result.current.createCheckoutSession('premium');
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'premium' }),
      });
      expect(mockLocation.assign).toHaveBeenCalledWith(mockUrl);
    });
  });

  it('should create customer portal session', async () => {
    const mockUrl = 'https://billing.stripe.com/portal';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: mockUrl }),
    });

    const { result } = renderHook(() => useSubscription(), { wrapper });

    const windowSpy = vi.spyOn(window, 'location', 'get');
    const mockLocation = {
      assign: vi.fn(),
      ancestorOrigins: [] as any,
      hash: '',
      host: '',
      hostname: '',
      href: '',
      origin: '',
      pathname: '',
      port: '',
      protocol: '',
      search: '',
      reload: vi.fn(),
      replace: vi.fn(),
      toString: () => '',
    } as Location;
    windowSpy.mockReturnValue(mockLocation);

    await act(async () => {
      await result.current.createCustomerPortalSession();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions/portal', {
        method: 'POST',
      });
      expect(mockLocation.assign).toHaveBeenCalledWith(mockUrl);
    });
  });

  it('should cancel subscription', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useSubscription(), { wrapper });

    await act(async () => {
      await result.current.cancelSubscription();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions/cancel', {
      method: 'POST',
    });
  });

  it('should provide subscription status helpers', () => {
    const { result } = renderHook(() => useSubscription(), { wrapper });

    act(() => {
      result.current.setSubscription({
        status: 'active',
        plan: 'premium',
        currentPeriodEnd: '2024-12-31',
      });
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.isPremium).toBe(true);
    expect(result.current.isBusiness).toBe(false);
  });
}); 
