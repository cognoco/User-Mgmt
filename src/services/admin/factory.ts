/**
 * Admin Service Factory for API Routes
 *
 * This file provides factory functions for creating admin services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { AdminService } from '@/core/admin/interfaces';
import type { IAdminDataProvider } from '@/core/admin';
import { AdapterRegistry } from '@/adapters/registry';
import { DefaultAdminService } from './default-admin.service';

// Singleton instance for API routes
let adminServiceInstance: AdminService | null = null;

/**
 * Get the configured admin service instance for API routes
 *
 * @returns Configured AdminService instance
 */
export function getApiAdminService(): AdminService {
  if (!adminServiceInstance) {
    const provider = AdapterRegistry.getInstance().getAdapter<IAdminDataProvider>('admin');
    adminServiceInstance = new DefaultAdminService(provider);
  }

  return adminServiceInstance;
}
