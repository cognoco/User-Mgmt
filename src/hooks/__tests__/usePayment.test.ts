import { renderHook, act } from '@testing-library/react';
import { usePayment } from '../usePayment';
import { describe, it, expect, vi, beforeEach, MockInstance } from 'vitest';
import { api } from '@/lib/api/axios';

// Define types if they don't exist in the codebase
interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: string;
  expiryYear?: string;
}

// Mock axios api
vi.mock('@/lib/api/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('usePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch payment methods successfully', async () => {
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: '1',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: '12',
        expiryYear: '25',
      },
    ];

    ((api.get as unknown) as MockInstance).mockResolvedValueOnce({ data: mockPaymentMethods });

    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.fetchPaymentMethods();
    });

    expect(api.get).toHaveBeenCalledWith('/payment/methods');
    expect(result.current.paymentMethods).toEqual(mockPaymentMethods);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch payment methods error', async () => {
    ((api.get as unknown) as MockInstance).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.fetchPaymentMethods();
    });

    expect(api.get).toHaveBeenCalledWith('/payment/methods');
    expect(result.current.paymentMethods).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch payment methods');
  });

  it('should add payment method successfully', async () => {
    const newPaymentMethod: PaymentMethod = {
      id: '2',
      type: 'card',
      last4: '1234',
      brand: 'mastercard',
      expiryMonth: '01',
      expiryYear: '26',
    };

    ((api.post as unknown) as MockInstance).mockResolvedValueOnce({ data: newPaymentMethod });

    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.addPaymentMethod(newPaymentMethod);
    });

    expect(api.post).toHaveBeenCalledWith('/payment/methods', newPaymentMethod);
    expect(result.current.paymentMethods).toContainEqual(newPaymentMethod);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle add payment method error', async () => {
    const newPaymentMethod: PaymentMethod = {
      id: '2',
      type: 'card',
      last4: '1234',
      brand: 'mastercard',
      expiryMonth: '01',
      expiryYear: '26',
    };

    ((api.post as unknown) as MockInstance).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.addPaymentMethod(newPaymentMethod);
    });

    expect(api.post).toHaveBeenCalledWith('/payment/methods', newPaymentMethod);
    expect(result.current.paymentMethods).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed to add payment method');
  });

  it('should remove payment method successfully', async () => {
    const paymentMethodId = '1';
    ((api.delete as unknown) as MockInstance).mockResolvedValueOnce({});

    const { result } = renderHook(() => usePayment());
    
    // Add a payment method first
    result.current.paymentMethods = [
      {
        id: paymentMethodId,
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: '12',
        expiryYear: '25',
      },
    ];

    await act(async () => {
      await result.current.removePaymentMethod(paymentMethodId);
    });

    expect(api.delete).toHaveBeenCalledWith(`/payment/methods/${paymentMethodId}`);
    expect(result.current.paymentMethods).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle remove payment method error', async () => {
    const paymentMethodId = '1';
    ((api.delete as unknown) as MockInstance).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.removePaymentMethod(paymentMethodId);
    });

    expect(api.delete).toHaveBeenCalledWith(`/payment/methods/${paymentMethodId}`);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed to remove payment method');
  });

  it('should fetch subscription successfully', async () => {
    const mockSubscription = {
      id: '1',
      status: 'active',
      currentPeriodEnd: '2024-12-31',
      plan: {
        id: 'premium',
        name: 'Premium',
        price: 10,
        interval: 'month',
      },
    };

    ((api.get as unknown) as MockInstance).mockResolvedValueOnce({ data: mockSubscription });

    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.fetchSubscription();
    });

    expect(api.get).toHaveBeenCalledWith('/subscriptions/active');
    expect(result.current.activeSubscription).toEqual(mockSubscription);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch subscription error', async () => {
    ((api.get as unknown) as MockInstance).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.fetchSubscription();
    });

    expect(api.get).toHaveBeenCalledWith('/subscriptions/active');
    expect(result.current.activeSubscription).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch subscription');
  });

  it('should cancel subscription successfully', async () => {
    ((api.post as unknown) as MockInstance).mockResolvedValueOnce({});

    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.cancelSubscription();
    });

    expect(api.post).toHaveBeenCalledWith('/subscriptions/cancel');
    expect(result.current.activeSubscription).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle cancel subscription error', async () => {
    ((api.post as unknown) as MockInstance).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.cancelSubscription();
    });

    expect(api.post).toHaveBeenCalledWith('/subscriptions/cancel');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed to cancel subscription');
  });

  it('should fetch payment history successfully', async () => {
    const mockPaymentHistory = [
      {
        id: '1',
        amount: 10,
        status: 'succeeded',
        date: '2024-01-01',
        description: 'Premium subscription',
      },
    ];

    ((api.get as unknown) as MockInstance).mockResolvedValueOnce({ data: mockPaymentHistory });

    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.fetchPaymentHistory();
    });

    expect(api.get).toHaveBeenCalledWith('/payment/history');
    expect(result.current.paymentHistory).toEqual(mockPaymentHistory);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch payment history error', async () => {
    ((api.get as unknown) as MockInstance).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.fetchPaymentHistory();
    });

    expect(api.get).toHaveBeenCalledWith('/payment/history');
    expect(result.current.paymentHistory).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch payment history');
  });
});

describe('cancelSubscription', () => {
  it('should successfully cancel subscription', async () => {
    const { result } = renderHook(() => usePayment());
    
    // Mock successful API call
    ((api.post as unknown) as MockInstance).mockResolvedValueOnce({});
    
    await act(async () => {
      await result.current.cancelSubscription();
    });
    
    expect(api.post).toHaveBeenCalledWith('/subscriptions/cancel');
    expect(result.current.activeSubscription).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when canceling subscription fails', async () => {
    const { result } = renderHook(() => usePayment());
    
    // Mock failed API call
    ((api.post as unknown) as MockInstance).mockRejectedValueOnce(new Error('API Error'));
    
    await act(async () => {
      await result.current.cancelSubscription();
    });
    
    expect(api.post).toHaveBeenCalledWith('/subscriptions/cancel');
    expect(result.current.error).toBe('Failed to cancel subscription');
    expect(result.current.isLoading).toBe(false);
  });
});

describe('fetchPaymentHistory', () => {
  const mockPaymentHistory = [
    {
      id: '1',
      amount: 100,
      status: 'succeeded' as const,
      date: '2024-01-01',
      description: 'Monthly subscription'
    }
  ];

  it('should successfully fetch payment history', async () => {
    const { result } = renderHook(() => usePayment());
    
    // Mock successful API call
    ((api.get as unknown) as MockInstance).mockResolvedValueOnce({ data: mockPaymentHistory });
    
    await act(async () => {
      await result.current.fetchPaymentHistory();
    });
    
    expect(api.get).toHaveBeenCalledWith('/payment/history');
    expect(result.current.paymentHistory).toEqual(mockPaymentHistory);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when fetching payment history fails', async () => {
    const { result } = renderHook(() => usePayment());
    
    // Mock failed API call
    ((api.get as unknown) as MockInstance).mockRejectedValueOnce(new Error('API Error'));
    
    await act(async () => {
      await result.current.fetchPaymentHistory();
    });
    
    expect(api.get).toHaveBeenCalledWith('/payment/history');
    expect(result.current.error).toBe('Failed to fetch payment history');
    expect(result.current.isLoading).toBe(false);
  });
}); 