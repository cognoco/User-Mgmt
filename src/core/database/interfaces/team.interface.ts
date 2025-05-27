import type { ITeamDataProvider } from '../../team/ITeamDataProvider';
import type { BaseDatabaseInterface } from './base.interface';
import type { Team } from '../../team/models';

/**
 * Database interface for teams.
 */
export interface TeamDatabaseInterface
  extends BaseDatabaseInterface<Team>, ITeamDataProvider {}
