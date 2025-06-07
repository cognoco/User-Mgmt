import { SubscriptionService } from '@/core/subscription/interfaces';
import type { ISubscriptionDataProvider } from '@/core/subscription';
import { DefaultSubscriptionService } from '@/services/subscription/defaultSubscription.service';

export interface SubscriptionServiceConfig {
  subscriptionDataProvider: ISubscriptionDataProvider;
}

export function createSubscriptionService(config: SubscriptionServiceConfig): SubscriptionService {
  return new DefaultSubscriptionService(config.subscriptionDataProvider);
}

export default { createSubscriptionService };

