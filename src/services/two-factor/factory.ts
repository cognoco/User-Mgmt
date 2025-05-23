/**
 * 2FA Service Factory for API Routes
 * 
 * This file provides factory functions for creating 2FA services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { TwoFactorService } from '@/core/two-factor/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { ITwoFactorDataProvider } from '@/core/two-factor';
import { createTwoFactorProvider } from '@/adapters/two-factor/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let twoFactorServiceInstance: TwoFactorService | null = null;

/**
 * Get the configured 2FA service instance for API routes
 * 
 * @returns Configured TwoFactorService instance
 */
export function getApiTwoFactorService(): TwoFactorService {
  if (!twoFactorServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create 2FA data provider
    const twoFactorDataProvider: ITwoFactorDataProvider = createTwoFactorProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create 2FA service with the data provider
    twoFactorServiceInstance = UserManagementConfiguration.getServiceProvider('twoFactorService') as TwoFactorService;
    
    // If no 2FA service is registered, throw an error
    if (!twoFactorServiceInstance) {
      throw new Error('Two-factor service not registered in UserManagementConfiguration');
    }
  }
  
  return twoFactorServiceInstance;
}
