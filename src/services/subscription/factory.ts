/**
 * Subscription Service Factory for API Routes
 * 
 * This file provides factory functions for creating subscription services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { SubscriptionService } from '@/core/subscription/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { ISubscriptionDataProvider } from '@/core/subscription';
import { AdapterRegistry } from '@/adapters/registry';
import { DefaultSubscriptionService } from './default-subscription.service';
import {
  getServiceContainer,
  getServiceConfiguration,
} from '@/lib/config/service-container';

// Singleton instance for API routes
export interface ApiSubscriptionServiceOptions {
  /** When true, clears the cached instance. Useful for tests */
  reset?: boolean;
}

let subscriptionServiceInstance: SubscriptionService | null = null;
let constructing = false;

/**
 * Get the configured subscription service instance for API routes
 * 
 * @returns Configured SubscriptionService instance
 */
export function getApiSubscriptionService(
  options: ApiSubscriptionServiceOptions = {},
): SubscriptionService | undefined {
  if (options.reset) {
    subscriptionServiceInstance = null;
  }

  if (!subscriptionServiceInstance && !constructing) {
    constructing = true;
    try {
      const containerService = getServiceContainer().subscription;
      if (containerService) {
        subscriptionServiceInstance = containerService;
      }
    } finally {
      constructing = false;
    }
  }

  if (!subscriptionServiceInstance) {
    const config = getServiceConfiguration();
    if (config.featureFlags?.subscription === false) {
      return undefined;
    }

    subscriptionServiceInstance =
      config.subscriptionService ||
      (UserManagementConfiguration.getServiceProvider(
        'subscriptionService',
      ) as SubscriptionService | undefined);

    if (!subscriptionServiceInstance) {
      const provider =
        AdapterRegistry.getInstance().getAdapter<ISubscriptionDataProvider>('subscription');
      subscriptionServiceInstance = new DefaultSubscriptionService(provider);
    }
  }

  return subscriptionServiceInstance;
}
