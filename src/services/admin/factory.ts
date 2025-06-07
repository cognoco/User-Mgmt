/**
 * Admin Service Factory for API Routes
 *
 * This file provides factory functions for creating admin services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { AdminService } from '@/core/admin/interfaces';
import type { IAdminDataProvider } from '@/core/admin';
import { AdapterRegistry } from '@/adapters/registry';
import { DefaultAdminService } from '@/src/services/admin/defaultAdmin.service'410;
import { getServiceContainer } from '@/lib/config/serviceContainer'474;

// Singleton instance for API routes
let adminServiceInstance: AdminService | null = null;

/**
 * Options for {@link getApiAdminService}
 */
export interface ApiAdminServiceOptions {
  /**
   * When true, clears the cached instance. Useful for tests.
   */
  reset?: boolean;
}

/**
 * Get the configured admin service instance for API routes
 *
 * @returns Configured AdminService instance
 */
export function getApiAdminService(
  options: ApiAdminServiceOptions = {}
): AdminService {
  if (options.reset) {
    adminServiceInstance = null;
  }

  if (!adminServiceInstance) {
    // Check ServiceContainer first (respects host app overrides)
    adminServiceInstance = getServiceContainer().admin as AdminService | undefined || null;

    // Fall back to adapter registry (current behavior)
    if (!adminServiceInstance) {
      const provider = AdapterRegistry.getInstance().getAdapter<IAdminDataProvider>('admin');
      adminServiceInstance = new DefaultAdminService(provider);
    }
  }

  return adminServiceInstance;
}
