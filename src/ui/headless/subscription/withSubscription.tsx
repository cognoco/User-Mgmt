/**
 * Headless subscription gating HOC
 */
import React from 'react';
import { useSubscriptionStore } from '@/lib/stores/subscription.store';
import { SubscriptionTier } from '@/types/subscription';
import { useUserManagement } from '@/lib/auth/UserManagementProvider';

export interface WithSubscriptionProps {
  featureName?: string;
  requiredTier?: SubscriptionTier;
  fallback?: React.ReactNode;
}

export function withSubscription<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithSubscriptionProps = {}
) {
  return function WithSubscriptionComponent(props: P) {
    const { hasFeature, getTier } = useSubscriptionStore();
    const { subscription } = useUserManagement();
    if (!subscription.enabled) {
      return <WrappedComponent {...props} />;
    }
    const hasAccess = options.featureName
      ? hasFeature(options.featureName)
      : options.requiredTier
        ? getTier() >= options.requiredTier
        : true;
    return hasAccess ? <WrappedComponent {...props} /> : options.fallback || null;
  };
}

export function SubscriptionGate({ children, featureName, requiredTier, fallback }: React.PropsWithChildren<WithSubscriptionProps>) {
  const { hasFeature, getTier } = useSubscriptionStore();
  const { subscription } = useUserManagement();
  if (!subscription.enabled) return <>{children}</>;
  const hasAccess = featureName ? hasFeature(featureName) : requiredTier ? getTier() >= requiredTier : true;
  return hasAccess ? <>{children}</> : fallback ? <>{fallback}</> : null;
}
