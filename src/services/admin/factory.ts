/**
 * Admin Service Factory for API Routes
 *
 * This file provides factory functions for creating admin services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { AdminService } from '@/core/admin/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { IAdminDataProvider } from '@/core/admin';
import { AdapterRegistry } from '@/adapters/registry';

// Singleton instance for API routes
let adminServiceInstance: AdminService | null = null;

/**
 * Get the configured admin service instance for API routes
 *
 * @returns Configured AdminService instance
 */
export function getApiAdminService(): AdminService {
  if (!adminServiceInstance) {
    // Get the admin adapter from the registry
    AdapterRegistry.getInstance().getAdapter<IAdminDataProvider>('admin');

    // Retrieve the service implementation
    adminServiceInstance = UserManagementConfiguration.getServiceProvider('adminService') as AdminService;

    // If no admin service is registered, throw an error
    if (!adminServiceInstance) {
      throw new Error('Admin service not registered in UserManagementConfiguration');
    }
  }

  return adminServiceInstance;
}
