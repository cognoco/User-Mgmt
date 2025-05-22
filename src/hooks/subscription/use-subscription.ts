import { useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSubscriptionStore } from '@/lib/stores/subscription.store';

/**
 * Hook exposing subscription management state and actions
 * wrapped around the Subscription store.
 */
export function useSubscription() {
  const {
    plans,
    userSubscription,
    isLoading,
    error,
    fetchPlans,
    fetchUserSubscription,
    subscribe,
    cancelSubscription,
    updateSubscription,
    isSubscribed,
    hasFeature,
    getTier,
    getRemainingTrialDays,
    clearError,
  } = useSubscriptionStore();

  // Automatically fetch subscription for current user on mount
  const { user } = useAuth();
  useEffect(() => {
    if (user?.id) {
      fetchUserSubscription(user.id);
    }
  }, [user?.id, fetchUserSubscription]);

  return {
    plans,
    userSubscription,
    isLoading,
    error,
    fetchPlans,
    fetchUserSubscription,
    subscribe,
    cancelSubscription,
    updateSubscription,
    isSubscribed,
    hasFeature,
    getTier,
    getRemainingTrialDays,
    clearError,
  };
}
