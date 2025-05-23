/**
 * Permission Service Factory for API Routes
 * 
 * This file provides factory functions for creating permission services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { PermissionService } from '@/core/permission/interfaces';
import type { IPermissionDataProvider } from '@/core/permission/IPermissionDataProvider';
import { DefaultPermissionService } from './default-permission.service';
import { AdapterRegistry } from '@/adapters/registry';

// Singleton instance for API routes
let permissionServiceInstance: PermissionService | null = null;

/**
 * Get the configured permission service instance for API routes
 * 
 * @returns Configured PermissionService instance
 */
export function getApiPermissionService(): PermissionService {
  if (!permissionServiceInstance) {
    // Get the permission adapter from the registry
    const permissionDataProvider = AdapterRegistry.getInstance().getAdapter<IPermissionDataProvider>('permission');

    // Create permission service with the adapter
    permissionServiceInstance = new DefaultPermissionService(permissionDataProvider);
  }
  
  return permissionServiceInstance;
}
