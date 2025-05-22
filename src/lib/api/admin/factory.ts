/**
 * Admin Service Factory for API Routes
 *
 * This file provides factory functions for creating admin services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { AdminService } from '@/core/admin/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import { createAdminProvider } from '@/adapters/admin/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let adminServiceInstance: AdminService | null = null;

/**
 * Get the configured admin service instance for API routes
 *
 * @returns Configured AdminService instance
 */
export function getApiAdminService(): AdminService {
  if (!adminServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();

    // Create admin data provider
    const adminDataProvider = createAdminProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });

    // Create admin service with the data provider
    adminServiceInstance = UserManagementConfiguration.getServiceProvider('adminService') as AdminService;

    // If no admin service is registered, throw an error
    if (!adminServiceInstance) {
      throw new Error('Admin service not registered in UserManagementConfiguration');
    }
  }

  return adminServiceInstance;
}
