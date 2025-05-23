/**
 * API Keys Service Factory for API Routes
 * 
 * This file provides factory functions for creating API key services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { ApiKeyService } from '@/core/api-key/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { IApiKeyDataProvider } from '@/core/api-keys';
import { createApiKeyProvider } from '@/adapters/api-key/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let apiKeyServiceInstance: ApiKeyService | null = null;

/**
 * Get the configured API key service instance for API routes
 * 
 * @returns Configured ApiKeyService instance
 */
export function getApiKeyService(): ApiKeyService {
  if (!apiKeyServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create API key data provider
    const apiKeyDataProvider: IApiKeyDataProvider = createApiKeyProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create API key service with the data provider
    apiKeyServiceInstance = UserManagementConfiguration.getServiceProvider('apiKeyService') as ApiKeyService;
    
    // If no API key service is registered, throw an error
    if (!apiKeyServiceInstance) {
      throw new Error('API Key service not registered in UserManagementConfiguration');
    }
  }
  
  return apiKeyServiceInstance;
}
