import { SubscriptionTier, SubscriptionStatus } from '@/core/subscription/models';
import { getApiSubscriptionService } from '@/src/services/subscription/factory';
import { ApiError } from '@/lib/api/common';
import { ERROR_CODES } from '@/lib/api/common/errorCodes';

/**
 * Ensure the user has the required subscription tier.
 * Throws {@link ApiError} if the tier requirement is not met.
 */
export async function ensureSubscriptionTier(
  userId: string,
  requiredTier: SubscriptionTier
): Promise<void> {
  const service = getApiSubscriptionService();
  const [plans, subscription] = await Promise.all([
    service.getPlans(),
    service.getUserSubscription(userId)
  ]);

  let userTier = SubscriptionTier.FREE;

  if (
    subscription &&
    (subscription.status === SubscriptionStatus.ACTIVE ||
      subscription.status === SubscriptionStatus.TRIAL)
  ) {
    const plan = plans.find(p => p.id === subscription.planId);
    if (plan) {
      userTier = plan.tier;
    }
  }

  const tiers = Object.values(SubscriptionTier);
  if (tiers.indexOf(userTier) < tiers.indexOf(requiredTier)) {
    throw new ApiError(
      ERROR_CODES.FORBIDDEN,
      'Upgrade your plan to access this feature',
      403
    );
  }
}
