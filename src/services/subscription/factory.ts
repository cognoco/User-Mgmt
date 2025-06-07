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
import { DefaultSubscriptionService } from '@/services/subscription/defaultSubscription.service';
import { getServiceContainer } from '@/lib/config/serviceContainer';

/** Options for {@link getApiSubscriptionService}. */
export interface ApiSubscriptionServiceOptions {
  /** When true, clears any cached instance (useful for testing). */
  reset?: boolean;
}

// Singleton instance for API routes
let subscriptionServiceInstance: SubscriptionService | null = null;
let constructing = false;

/**
 * Get the configured subscription service instance for API routes
 * 
 * @returns Configured SubscriptionService instance
 */
export function getApiSubscriptionService(
  options: ApiSubscriptionServiceOptions = {}
): SubscriptionService {
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
    const configuredService = UserManagementConfiguration.getServiceProvider('subscriptionService') as SubscriptionService | undefined;
    
    if (configuredService) {
      subscriptionServiceInstance = configuredService;
    } else {
      const provider = AdapterRegistry.getInstance().getAdapter<ISubscriptionDataProvider>('subscription');
      subscriptionServiceInstance = new DefaultSubscriptionService(provider);
    }
  }

  return subscriptionServiceInstance;
}
