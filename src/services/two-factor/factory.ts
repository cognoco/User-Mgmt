/**
 * 2FA Service Factory for API Routes
 * 
 * This file provides factory functions for creating 2FA services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { TwoFactorService } from '@/core/two-factor/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { ITwoFactorDataProvider } from '@/core/two-factor';
import { AdapterRegistry } from '@/adapters/registry';

// Singleton instance for API routes
let twoFactorServiceInstance: TwoFactorService | null = null;

/**
 * Get the configured 2FA service instance for API routes
 * 
 * @returns Configured TwoFactorService instance
 */
export function getApiTwoFactorService(): TwoFactorService {
  if (!twoFactorServiceInstance) {
    const twoFactorDataProvider = AdapterRegistry.getInstance().getAdapter<ITwoFactorDataProvider>('twoFactor');
    twoFactorServiceInstance = UserManagementConfiguration.getServiceProvider('twoFactorService') as TwoFactorService;
    if (!twoFactorServiceInstance) {
      throw new Error('Two-factor service not registered in UserManagementConfiguration');
    }
  }
  
  return twoFactorServiceInstance;
}

/**
 * Temporary alias for backwards compatibility. Will be removed once all
 * routes are updated to use the new naming convention.
 */
export function getApi2FAService(): TwoFactorService {
  return getApiTwoFactorService();
}
