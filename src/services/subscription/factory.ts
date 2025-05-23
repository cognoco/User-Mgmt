/**
 * Subscription Service Factory for API Routes
 * 
 * This file provides factory functions for creating subscription services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { SubscriptionService } from '@/core/subscription/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { ISubscriptionDataProvider } from '@/core/subscription';
import { createSubscriptionProvider } from '@/adapters/subscription/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let subscriptionServiceInstance: SubscriptionService | null = null;

/**
 * Get the configured subscription service instance for API routes
 * 
 * @returns Configured SubscriptionService instance
 */
export function getApiSubscriptionService(): SubscriptionService {
  if (!subscriptionServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create subscription data provider
    const subscriptionDataProvider: ISubscriptionDataProvider = createSubscriptionProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create subscription service with the data provider
    subscriptionServiceInstance = UserManagementConfiguration.getServiceProvider('subscriptionService') as SubscriptionService;
    
    // If no subscription service is registered, throw an error
    if (!subscriptionServiceInstance) {
      throw new Error('Subscription service not registered in UserManagementConfiguration');
    }
  }
  
  return subscriptionServiceInstance;
}
