import { ReactNode, useEffect } from 'react';
import { usePayment } from '@/hooks/user/usePayment';

interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  plan: {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
  };
}

export interface SubscriptionManagerProps {
  /**
   * Render prop with subscription data
   */
  render: (props: {
    activeSubscription: Subscription | null;
    isLoading: boolean;
    error: string | null;
    cancelSubscription: () => Promise<void>;
    refresh: () => Promise<void>;
  }) => ReactNode;
}

/**
 * Headless SubscriptionManager component
 */
export function SubscriptionManager({ render }: SubscriptionManagerProps) {
  const { activeSubscription, isLoading, error, fetchSubscription, cancelSubscription } = usePayment();

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const refresh = async () => {
    await fetchSubscription();
  };

  return (
    <>{render({ activeSubscription, isLoading, error, cancelSubscription, refresh })}</>
  );
}
