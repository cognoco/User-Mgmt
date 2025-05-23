/**
 * API Keys Service Factory for API Routes
 * 
 * This file provides factory functions for creating API key services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { ApiKeyService } from '@/core/api-key/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { IApiKeyDataProvider } from '@/core/api-keys';
import { AdapterRegistry } from '@/adapters/registry';

// Singleton instance for API routes
let apiKeyServiceInstance: ApiKeyService | null = null;

/**
 * Get the configured API key service instance for API routes
 * 
 * @returns Configured ApiKeyService instance
 */
export function getApiKeyService(): ApiKeyService {
  if (!apiKeyServiceInstance) {
    AdapterRegistry.getInstance().getAdapter<IApiKeyDataProvider>('apiKey');
    apiKeyServiceInstance = UserManagementConfiguration.getServiceProvider('apiKeyService') as ApiKeyService;

    // If no API key service is registered, throw an error
    if (!apiKeyServiceInstance) {
      throw new Error('API Key service not registered in UserManagementConfiguration');
    }
  }
  
  return apiKeyServiceInstance;
}

/**
 * Temporary alias for backwards compatibility with older route imports.
 */
export function getApiKeysService(): ApiKeyService {
  return getApiKeyService();
}
