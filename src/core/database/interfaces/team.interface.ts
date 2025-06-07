import type { ITeamDataProvider } from '@/src/core/team/ITeamDataProvider';
import type { BaseDatabaseInterface } from '@/src/core/database/interfaces/base.interface';
import type { Team } from '@/src/core/team/models';

/**
 * Database interface for teams.
 */
export interface TeamDatabaseInterface
  extends BaseDatabaseInterface<Team>, ITeamDataProvider {}
