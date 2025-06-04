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
import {
  getServiceContainer,
  getServiceConfiguration
} from '@/lib/config/service-container';

// Singleton instance for API routes
export interface ApiTwoFactorServiceOptions {
  /** When true, forces creation of a new service instance */
  reset?: boolean;
}

const GLOBAL_CACHE_KEY = '__UM_TWO_FACTOR_SERVICE__';

let twoFactorServiceInstance: TwoFactorService | null = null;

/**
 * Get the configured 2FA service instance for API routes
 * 
 * @returns Configured TwoFactorService instance
 */
export function getApiTwoFactorService(
  options: ApiTwoFactorServiceOptions = {}
): TwoFactorService {
  if (options.reset) {
    twoFactorServiceInstance = null;
    if (typeof globalThis !== 'undefined') {
      delete (globalThis as any)[GLOBAL_CACHE_KEY];
    }
  }

  if (!twoFactorServiceInstance && typeof globalThis !== 'undefined') {
    twoFactorServiceInstance = (globalThis as any)[GLOBAL_CACHE_KEY] as
      | TwoFactorService
      | null;
  }

  if (!twoFactorServiceInstance) {
    const config = getServiceConfiguration();

    if (config.twoFactorService) {
      twoFactorServiceInstance = config.twoFactorService;
    } else {
      try {
        twoFactorServiceInstance = getServiceContainer().twoFactor ?? null;
      } catch {
        // Service container not fully configured
      }

      if (!twoFactorServiceInstance) {
        twoFactorServiceInstance =
          UserManagementConfiguration.getServiceProvider(
            'twoFactorService'
          ) as TwoFactorService | null;

        if (!twoFactorServiceInstance) {
          throw new Error(
            'Two-factor service not registered in UserManagementConfiguration'
          );
        }
      }
    }

    if (typeof globalThis !== 'undefined') {
      (globalThis as any)[GLOBAL_CACHE_KEY] = twoFactorServiceInstance;
    }
  }

  return twoFactorServiceInstance;
}

/**
 * Temporary alias for backwards compatibility. Will be removed once all
 * routes are updated to use the new naming convention.
 */
export function getApi2FAService(
  options: ApiTwoFactorServiceOptions = {}
): TwoFactorService {
  return getApiTwoFactorService(options);
}
