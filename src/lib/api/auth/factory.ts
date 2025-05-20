/**
 * Auth Service Factory for API Routes
 * 
 * This file provides factory functions for creating auth services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { AuthService } from '@/core/auth/interfaces';
import { DefaultAuthService } from '@/services/auth/default-auth.service';
import { createAuthProvider } from '@/adapters/auth/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let authServiceInstance: AuthService | null = null;

/**
 * Get the configured auth service instance for API routes
 * 
 * @returns Configured AuthService instance
 */
export function getApiAuthService(): AuthService {
  if (!authServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create auth data provider
    const authDataProvider = createAuthProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create auth service with the data provider
    authServiceInstance = new DefaultAuthService(null, authDataProvider);
  }
  
  return authServiceInstance;
}
