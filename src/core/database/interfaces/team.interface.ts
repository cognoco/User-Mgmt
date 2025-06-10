import type { ITeamDataProvider } from '@/core/team/ITeamDataProvider';
import type { BaseDatabaseInterface } from '@/core/database/interfaces/base.interface';
import type { Team } from '@/core/team/models';

/**
 * Database interface for teams.
 */
export interface TeamDatabaseInterface
  extends BaseDatabaseInterface<Team>, ITeamDataProvider {}
