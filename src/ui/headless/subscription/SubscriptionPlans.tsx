/**
 * Headless Subscription Plans
 *
 * Provides subscription plans data and selection callbacks via render props.
 */
import { useEffect, useState } from 'react';
import { useSubscriptionStore } from '@/lib/stores/subscription.store';
import { SubscriptionPeriod } from '@/types/subscription';

export interface SubscriptionPlansProps {
  periods?: SubscriptionPeriod[];
  defaultPeriod?: SubscriptionPeriod;
  onSelect?: (planId: string) => void;
  render: (props: {
    plans: any[];
    selectedPeriod: SubscriptionPeriod;
    setSelectedPeriod: (p: SubscriptionPeriod) => void;
    isLoading: boolean;
    error: string | null;
    select: (id: string) => void;
  }) => React.ReactNode;
}

export function SubscriptionPlans({ periods = [SubscriptionPeriod.MONTHLY], defaultPeriod = periods[0], onSelect, render }: SubscriptionPlansProps) {
  const { fetchPlans, plans, isLoading, error } = useSubscriptionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>(defaultPeriod);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const select = (id: string) => onSelect?.(id);

  const filtered = plans.filter(p => p.period === selectedPeriod);

  return <>{render({ plans: filtered, selectedPeriod, setSelectedPeriod, isLoading, error, select })}</>;
}
