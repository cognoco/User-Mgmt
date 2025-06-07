import { renderHook, act } from '@testing-library/react';
import { useBilling } from '@/hooks/subscription/useBilling';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { usePayment } from '@/hooks/user/usePayment';

vi.mock('@/hooks/user/usePayment');

describe('useBilling', () => {
  const fetchPaymentMethods = vi.fn();
  const fetchPaymentHistory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePayment as unknown as vi.Mock).mockReturnValue({
      paymentMethods: [],
      activeSubscription: null,
      paymentHistory: [],
      isLoading: false,
      error: null,
      fetchPaymentMethods,
      addPaymentMethod: vi.fn(),
      removePaymentMethod: vi.fn(),
      fetchSubscription: vi.fn(),
      cancelSubscription: vi.fn(),
      fetchPaymentHistory,
    });
  });

  it('fetches billing data on mount', () => {
    renderHook(() => useBilling());
    expect(fetchPaymentMethods).toHaveBeenCalled();
    expect(fetchPaymentHistory).toHaveBeenCalled();
  });

  it('exposes store actions', () => {
    const { result } = renderHook(() => useBilling());
    act(() => {
      result.current.fetchPaymentMethods();
    });
    expect(fetchPaymentMethods).toHaveBeenCalledTimes(2); // called once on mount
  });
});
