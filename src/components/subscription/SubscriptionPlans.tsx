import { useEffect, useState } from 'react';
import { useSubscriptionStore } from '@/lib/stores/subscription.store';
import { SubscriptionPeriod, SubscriptionTier } from '@/lib/types/subscription';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { PlatformComponent } from '@/lib/auth/UserManagementProvider';

export interface SubscriptionPlansProps {
  onSelect?: (planId: string) => void;
  showFreePlan?: boolean;
  periods?: SubscriptionPeriod[];
  defaultPeriod?: SubscriptionPeriod;
  className?: string;
}

export function SubscriptionPlans({
  onSelect,
  showFreePlan = true,
  periods = [SubscriptionPeriod.MONTHLY, SubscriptionPeriod.YEARLY],
  defaultPeriod = SubscriptionPeriod.MONTHLY,
  className = '',
}: SubscriptionPlansProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { plans, fetchPlans, userSubscription, fetchUserSubscription, isLoading, error } = useSubscriptionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>(defaultPeriod);
  
  useEffect(() => {
    // Fetch available plans
    fetchPlans();
    
    // Fetch user's subscription if user is logged in
    if (user) {
      fetchUserSubscription(String(user.id));
    }
  }, [fetchPlans, fetchUserSubscription, user]);
  
  // Filter plans based on selected period and showFreePlan option
  const filteredPlans = plans.filter(plan => {
    const isMatchingPeriod = plan.period === selectedPeriod;
    const isFreePlan = plan.tier === SubscriptionTier.FREE;
    
    return isMatchingPeriod && (showFreePlan || !isFreePlan);
  });
  
  // Check if a plan is the user's current plan
  const isCurrentPlan = (planId: string) => {
    return userSubscription?.planId === planId && 
           (userSubscription?.status === 'active' || userSubscription?.status === 'trial');
  };
  
  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    onSelect?.(planId);
  };
  
  // Calculate savings percentage for yearly plans
  const getSavingsPercent = (plan: any) => {
    if (plan.period !== SubscriptionPeriod.YEARLY) return null;
    
    // Find the equivalent monthly plan
    const monthlyPlan = plans.find(p => 
      p.tier === plan.tier && p.period === SubscriptionPeriod.MONTHLY
    );
    
    if (!monthlyPlan) return null;
    
    const yearlyCost = plan.price;
    const monthlyCost = monthlyPlan.price * 12;
    const savings = monthlyCost - yearlyCost;
    const savingsPercent = Math.round((savings / monthlyCost) * 100);
    
    return savingsPercent > 0 ? savingsPercent : null;
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Period selector */}
      {periods.length > 1 && (
        <div className="flex justify-center space-x-2 mb-8">
          {periods.map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {t(`subscription.period.${period.toLowerCase()}`)}
            </Button>
          ))}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="text-red-500 text-center mb-4">
          {t('subscription.error.loading')}
        </div>
      )}
      
      {/* Plans grid */}
      <PlatformComponent
        web={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map(plan => (
              <Card 
                key={plan.id}
                className={`
                  border ${plan.tier === SubscriptionTier.PREMIUM ? 'border-purple-400 shadow-md' : 'border-gray-200'}
                  ${isCurrentPlan(plan.id) ? 'bg-blue-50' : ''}
                `}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {t(`subscription.tier.${plan.tier.toLowerCase()}`