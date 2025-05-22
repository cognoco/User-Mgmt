/**
 * Webhooks Service Factory for API Routes
 * 
 * This file provides factory functions for creating webhook services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { WebhookService } from '@/core/webhook/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import { createWebhookProvider } from '@/adapters/webhook/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let webhookServiceInstance: WebhookService | null = null;

/**
 * Get the configured webhook service instance for API routes
 * 
 * @returns Configured WebhookService instance
 */
export function getApiWebhookService(): WebhookService {
  if (!webhookServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create webhook data provider
    const webhookDataProvider = createWebhookProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create webhook service with the data provider
    webhookServiceInstance = UserManagementConfiguration.getServiceProvider('webhookService') as WebhookService;
    
    // If no webhook service is registered, throw an error
    if (!webhookServiceInstance) {
      throw new Error('Webhook service not registered in UserManagementConfiguration');
    }
  }
  
  return webhookServiceInstance;
}
