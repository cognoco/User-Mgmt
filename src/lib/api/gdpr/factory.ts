/**
 * GDPR Service Factory for API Routes
 * 
 * This file provides factory functions for creating GDPR services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { GdprService } from '@/core/gdpr/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import { createGdprProvider } from '@/adapters/gdpr/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let gdprServiceInstance: GdprService | null = null;

/**
 * Get the configured GDPR service instance for API routes
 * 
 * @returns Configured GdprService instance
 */
export function getApiGdprService(): GdprService {
  if (!gdprServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create GDPR data provider
    const gdprDataProvider = createGdprProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create GDPR service with the data provider
    gdprServiceInstance = UserManagementConfiguration.getServiceProvider('gdprService') as GdprService;
    
    // If no GDPR service is registered, throw an error
    if (!gdprServiceInstance) {
      throw new Error('GDPR service not registered in UserManagementConfiguration');
    }
  }
  
  return gdprServiceInstance;
}
