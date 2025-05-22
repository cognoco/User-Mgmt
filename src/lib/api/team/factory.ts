/**
 * Team Service Factory for API Routes
 * 
 * This file provides factory functions for creating team services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { TeamService } from '@/core/team/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import { createTeamProvider } from '@/adapters/team/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let teamServiceInstance: TeamService | null = null;

/**
 * Get the configured team service instance for API routes
 * 
 * @returns Configured TeamService instance
 */
export function getApiTeamService(): TeamService {
  if (!teamServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create team data provider
    const teamDataProvider = createTeamProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create team service with the data provider
    teamServiceInstance = UserManagementConfiguration.getServiceProvider('teamService') as TeamService;
    
    // If no team service is registered, throw an error
    if (!teamServiceInstance) {
      throw new Error('Team service not registered in UserManagementConfiguration');
    }
  }
  
  return teamServiceInstance;
}
