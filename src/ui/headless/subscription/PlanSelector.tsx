import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSubscription } from '@/hooks/subscription/use-subscription';
import type { SubscriptionPlan } from '@/types/subscription';

export interface PlanSelectorProps {
  render: (props: {
    plans: SubscriptionPlan[];
    isLoading: boolean;
    error: string | null;
    selectPlan: (planId: string) => Promise<void>;
  }) => ReactNode;
}

export function PlanSelector({ render }: PlanSelectorProps) {
  const { user } = useAuth();
  const { plans, isLoading, error, fetchPlans, subscribe } = useSubscription();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const selectPlan = async (planId: string) => {
    if (!user?.id) return;
    await subscribe(user.id, planId);
  };

  return <>{render({ plans, isLoading, error, selectPlan })}</>;
}
