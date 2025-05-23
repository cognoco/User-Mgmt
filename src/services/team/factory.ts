/**
 * Team Service Factory for API Routes
 * 
 * This file provides factory functions for creating team services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { TeamService } from '@/core/team/interfaces';
import type { ITeamDataProvider } from '@/core/team/ITeamDataProvider';
import { DefaultTeamService } from './default-team.service';
import { AdapterRegistry } from '@/adapters/registry';

/**
 * Get the configured team service instance for API routes
 * 
 * @returns Configured TeamService instance
 */
export function getApiTeamService(): TeamService {
  const teamDataProvider =
    AdapterRegistry.getInstance().getAdapter<ITeamDataProvider>('team');
  return new DefaultTeamService(teamDataProvider);
}
