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

// Singleton instance for API routes
let subscriptionServiceInstance: SubscriptionService | null = null;

/**
 * Get the configured subscription service instance for API routes
 * 
 * @returns Configured SubscriptionService instance
 */
export function getApiSubscriptionService(): SubscriptionService {
  if (!subscriptionServiceInstance) {
    AdapterRegistry.getInstance().getAdapter<ISubscriptionDataProvider>('subscription');
    subscriptionServiceInstance = UserManagementConfiguration.getServiceProvider('subscriptionService') as SubscriptionService;

    // If no subscription service is registered, throw an error
    if (!subscriptionServiceInstance) {
      throw new Error('Subscription service not registered in UserManagementConfiguration');
    }
  }
  
  return subscriptionServiceInstance;
}
