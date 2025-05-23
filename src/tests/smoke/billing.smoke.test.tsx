import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BillingPage from '../../../app/billing/page';
import { useSubscription } from '@/hooks/subscription/useSubscription';
import { useBilling } from '@/hooks/subscription/useBilling';

vi.mock('@/hooks/subscription/useSubscription');
vi.mock('@/hooks/subscription/useBilling');

describe('Smoke: Billing Page', () => {
  it('renders subscription and billing sections', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'jest',
      configurable: true,
    });
    (useSubscription as unknown as vi.Mock).mockReturnValue({
      subscription: null,
      plans: [],
      loading: false,
      error: null,
      fetchPlans: vi.fn(),
      changePlan: vi.fn(),
      cancelSubscription: vi.fn(),
    });
    (useBilling as unknown as vi.Mock).mockReturnValue({
      billingInfo: null,
      invoices: [],
      paymentMethods: [],
      paymentHistory: [],
      loading: false,
      error: null,
      updateBillingInfo: vi.fn(),
    });

    render(<BillingPage />);
    expect(screen.getByText(/Subscription Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Current Subscription/i)).toBeInTheDocument();
    expect(screen.getByText(/Available Plans/i)).toBeInTheDocument();
    expect(screen.getByText(/Billing Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Invoice History/i)).toBeInTheDocument();
  });

  it('renders with active subscription', () => {
    (useSubscription as unknown as vi.Mock).mockReturnValue({
      subscription: { id: 'sub1', planId: 'pro', status: 'active' },
      plans: [{ id: 'pro', tier: 'pro', price: 10, features: [] }],
      loading: false,
      error: null,
      fetchPlans: vi.fn(),
      changePlan: vi.fn(),
      cancelSubscription: vi.fn(),
    });
    (useBilling as unknown as vi.Mock).mockReturnValue({
      billingInfo: { address: '123' },
      invoices: [{ id: 'inv1', description: 'test', amount: 1 }],
      paymentMethods: [{ id: 'pm1', type: 'card', brand: 'visa', last4: '1234', expiryMonth: '01', expiryYear: '25' }],
      paymentHistory: [{ id: 'p1', date: '2020-01-01', description: 'test', amount: 1, status: 'succeeded' }],
      loading: false,
      error: null,
      updateBillingInfo: vi.fn(),
    });

    render(<BillingPage />);
    expect(screen.getByText(/Current Subscription/i)).toBeInTheDocument();
    expect(screen.getByText(/Invoice History/i)).toBeInTheDocument();
  });
});
