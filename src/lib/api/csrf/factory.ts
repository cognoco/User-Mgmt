/**
 * CSRF Service Factory for API Routes
 * 
 * This file provides factory functions for creating CSRF services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { CsrfService } from '@/core/csrf/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import { createCsrfProvider } from '@/adapters/csrf/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let csrfServiceInstance: CsrfService | null = null;

/**
 * Get the configured CSRF service instance for API routes
 * 
 * @returns Configured CsrfService instance
 */
export function getApiCsrfService(): CsrfService {
  if (!csrfServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create CSRF data provider
    const csrfDataProvider = createCsrfProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create CSRF service with the data provider
    csrfServiceInstance = UserManagementConfiguration.getServiceProvider('csrfService') as CsrfService;
    
    // If no CSRF service is registered, throw an error
    if (!csrfServiceInstance) {
      throw new Error('CSRF service not registered in UserManagementConfiguration');
    }
  }
  
  return csrfServiceInstance;
}
