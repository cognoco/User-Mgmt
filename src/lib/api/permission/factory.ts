/**
 * Permission Service Factory for API Routes
 * 
 * This file provides factory functions for creating permission services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { PermissionService } from '@/core/permission/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import { createPermissionProvider } from '@/adapters/permission/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let permissionServiceInstance: PermissionService | null = null;

/**
 * Get the configured permission service instance for API routes
 * 
 * @returns Configured PermissionService instance
 */
export function getApiPermissionService(): PermissionService {
  if (!permissionServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create permission data provider
    const permissionDataProvider = createPermissionProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create permission service with the data provider
    permissionServiceInstance = UserManagementConfiguration.getServiceProvider('permissionService') as PermissionService;
    
    // If no permission service is registered, throw an error
    if (!permissionServiceInstance) {
      throw new Error('Permission service not registered in UserManagementConfiguration');
    }
  }
  
  return permissionServiceInstance;
}
