import { useState } from 'react';

interface Subscription {
  status: 'active' | 'past_due' | 'canceled' | 'incomplete';
  plan: 'free' | 'premium' | 'business';
  currentPeriodEnd: string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/subscriptions/status');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch subscription');
      }
      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckoutSession = async (plan: 'premium' | 'business') => {
    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }
      const { url } = await response.json();
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
    }
  };

  const createCustomerPortalSession = async () => {
    try {
      const response = await fetch('/api/subscriptions/portal', {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create portal session');
      }
      const { url } = await response.json();
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create portal session');
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }
      await fetchSubscription();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    }
  };

  const isActive = subscription?.status === 'active';
  const isPremium = isActive && subscription?.plan === 'premium';
  const isBusiness = isActive && subscription?.plan === 'business';

  return {
    subscription,
    setSubscription,
    isLoading,
    error,
    fetchSubscription,
    createCheckoutSession,
    createCustomerPortalSession,
    cancelSubscription,
    isActive,
    isPremium,
    isBusiness,
  };
} 