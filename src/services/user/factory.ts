/**
 * User Service Factory for API Routes
 * 
 * This file provides factory functions for creating user services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { UserService } from '@/core/user/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { IUserDataProvider } from '@/core/user';
import { createUserProvider } from '@/adapters/user/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let userServiceInstance: UserService | null = null;

/**
 * Get the configured user service instance for API routes
 * 
 * @returns Configured UserService instance
 */
export function getApiUserService(): UserService {
  if (!userServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create user data provider
    const userDataProvider: IUserDataProvider = createUserProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create user service with the data provider
    userServiceInstance = UserManagementConfiguration.getServiceProvider('userService') as UserService;
    
    // If no user service is registered, throw an error
    if (!userServiceInstance) {
      throw new Error('User service not registered in UserManagementConfiguration');
    }
  }
  
  return userServiceInstance;
}
