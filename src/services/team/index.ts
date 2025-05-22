/**
 * Team Service Factory
 * 
 * This file exports the factory function for creating an instance of the TeamService.
 * It follows the factory pattern to allow dependency injection and configuration.
 */

import { TeamService } from '@/core/team/interfaces';
import { DefaultTeamService } from './default-team.service';
import type { AxiosInstance } from 'axios';
import type { TeamDataProvider } from '@/adapters/team/interfaces';

/**
 * Configuration options for creating a TeamService
 */
export interface TeamServiceConfig {
  /**
   * API client for making HTTP requests
   */
  apiClient: AxiosInstance;
  
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
  return new DefaultTeamService(config.apiClient, config.teamDataProvider);
}

/**
 * Default export of the team service module
 */
export default {
  createTeamService
};
