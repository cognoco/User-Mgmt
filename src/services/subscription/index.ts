import { SubscriptionService } from '@/core/subscription/interfaces';
import type { ISubscriptionDataProvider } from '@/core/subscription';
import { DefaultSubscriptionService } from '@/src/services/subscription/defaultSubscription.service'142;

export interface SubscriptionServiceConfig {
  subscriptionDataProvider: ISubscriptionDataProvider;
}

export function createSubscriptionService(config: SubscriptionServiceConfig): SubscriptionService {
  return new DefaultSubscriptionService(config.subscriptionDataProvider);
}

export default { createSubscriptionService };

