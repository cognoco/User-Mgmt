/**
 * SSO Service Factory for API Routes
 * 
 * This file provides factory functions for creating SSO services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { SsoService } from '@/core/sso/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { ISsoDataProvider } from '@/core/sso';
import { createSsoProvider } from '@/adapters/sso/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let ssoServiceInstance: SsoService | null = null;

/**
 * Get the configured SSO service instance for API routes
 * 
 * @returns Configured SsoService instance
 */
export function getApiSsoService(): SsoService {
  if (!ssoServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create SSO data provider
    const ssoDataProvider: ISsoDataProvider = createSsoProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create SSO service with the data provider
    ssoServiceInstance = UserManagementConfiguration.getServiceProvider('ssoService') as SsoService;
    
    // If no SSO service is registered, throw an error
    if (!ssoServiceInstance) {
      throw new Error('SSO service not registered in UserManagementConfiguration');
    }
  }
  
  return ssoServiceInstance;
}
