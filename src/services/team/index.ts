/**
 * Team Service Factory
 * 
 * This file exports the factory function for creating an instance of the TeamService.
 * It follows the factory pattern to allow dependency injection and configuration.
 */

// Client-safe exports only
export * from './api-team.service';
export type { TeamService } from '@/core/team/interfaces';

/**
 * Configuration options for creating a TeamService
 */
export interface TeamServiceConfig {
  /**
   * Team data provider for database operations
   */
  teamDataProvider: TeamDataProvider;
}

/**
 * Create an instance of the TeamService
 * 
 * @param config - Configuration options for the TeamService
 * @returns An instance of the TeamService
 */
export function createTeamService(config: TeamServiceConfig): TeamService {
  return new DefaultTeamService(config.teamDataProvider);
}

/**
 * Default export of the team service module
 */
export default {
  createTeamService
};
