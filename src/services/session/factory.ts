/**
 * Session Service Factory for API Routes
 * 
 * This file provides factory functions for creating session services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { SessionService } from '@/core/session/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { ISessionDataProvider } from '@/core/session';
import { createSessionProvider } from '@/adapters/session/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let sessionServiceInstance: SessionService | null = null;

/**
 * Get the configured session service instance for API routes
 * 
 * @returns Configured SessionService instance
 */
export function getApiSessionService(): SessionService {
  if (!sessionServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create session data provider
    const sessionDataProvider: ISessionDataProvider = createSessionProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create session service with the data provider
    sessionServiceInstance = UserManagementConfiguration.getServiceProvider('sessionService') as SessionService;
    
    // If no session service is registered, throw an error
    if (!sessionServiceInstance) {
      throw new Error('Session service not registered in UserManagementConfiguration');
    }
  }
  
  return sessionServiceInstance;
}
