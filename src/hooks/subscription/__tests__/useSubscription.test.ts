import { renderHook, act } from '@testing-library/react';
import { useSubscription } from '../useSubscription';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { useSubscriptionStore } from '@/lib/stores/subscription.store';
import { useAuth } from '@/hooks/auth/useAuth';

vi.mock('@/lib/stores/subscription.store');
vi.mock('@/hooks/auth/useAuth');

describe('useSubscription', () => {
  const fetchUserSubscription = vi.fn();
  const fetchPlans = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSubscriptionStore as unknown as vi.Mock).mockReturnValue({
      plans: [],
      userSubscription: null,
      isLoading: false,
      error: null,
      fetchPlans,
      fetchUserSubscription,
      subscribe: vi.fn(),
      cancelSubscription: vi.fn(),
      updateSubscription: vi.fn(),
      isSubscribed: vi.fn(() => false),
      hasFeature: vi.fn(() => false),
      getTier: vi.fn(() => 'free'),
      getRemainingTrialDays: vi.fn(() => null),
      clearError: vi.fn(),
    });
    (useAuth as unknown as vi.Mock).mockReturnValue({ user: { id: '123' } });
  });

  it('fetches subscription on mount', () => {
    renderHook(() => useSubscription());
    expect(fetchUserSubscription).toHaveBeenCalledWith('123');
  });

  it('exposes store values', () => {
    const { result } = renderHook(() => useSubscription());
    expect(result.current.isLoading).toBe(false);
    act(() => {
      result.current.fetchPlans();
    });
    expect(fetchPlans).toHaveBeenCalled();
  });
});
