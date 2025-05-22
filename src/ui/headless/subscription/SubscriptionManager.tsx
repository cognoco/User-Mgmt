import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSubscription } from '@/hooks/subscription/use-subscription';
import type { UserSubscription } from '@/types/subscription';

export interface SubscriptionManagerProps {
  render: (props: {
    subscription: UserSubscription | null;
    isLoading: boolean;
    error: string | null;
    cancel: () => Promise<void>;
    refresh: () => Promise<void>;
  }) => ReactNode;
}

export function SubscriptionManager({ render }: SubscriptionManagerProps) {
  const { user } = useAuth();
  const {
    userSubscription,
    isLoading,
    error,
    fetchUserSubscription,
    cancelSubscription,
  } = useSubscription();

  useEffect(() => {
    if (user?.id) {
      fetchUserSubscription(user.id);
    }
  }, [user?.id, fetchUserSubscription]);

  const refresh = async () => {
    if (user?.id) {
      await fetchUserSubscription(user.id);
    }
  };

  const cancel = async () => {
    if (!userSubscription) return;
    await cancelSubscription(userSubscription.id, false);
  };

  return <>{render({ subscription: userSubscription, isLoading, error, cancel, refresh })}</>;
}
