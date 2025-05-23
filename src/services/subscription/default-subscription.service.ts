import { SubscriptionService } from '@/core/subscription/interfaces';
import type { ISubscriptionDataProvider } from '@/core/subscription';
import type { SubscriptionPlan, UserSubscription } from '@/core/subscription/models';

export class DefaultSubscriptionService implements SubscriptionService {
  constructor(private provider: ISubscriptionDataProvider) {}

  getPlans(): Promise<SubscriptionPlan[]> {
    return this.provider.getPlans();
  }

  getUserSubscription(userId: string): Promise<UserSubscription | null> {
    return this.provider.getUserSubscription(userId);
  }

  createSubscription(userId: string, planId: string) {
    return this.provider.createSubscription(userId, planId);
  }

  cancelSubscription(subscriptionId: string, immediate?: boolean) {
    return this.provider.cancelSubscription(subscriptionId, immediate);
  }

  updateSubscription(subscriptionId: string, planId: string) {
    return this.provider.updateSubscription(subscriptionId, planId);
  }
}
