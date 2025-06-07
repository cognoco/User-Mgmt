import type { ITeamDataProvider } from '@/src/core/team/ITeamDataProvider'0;
import type { BaseDatabaseInterface } from '@/src/core/database/interfaces/base.interface'72;
import type { Team } from '@/src/core/team/models'136;

/**
 * Database interface for teams.
 */
export interface TeamDatabaseInterface
  extends BaseDatabaseInterface<Team>, ITeamDataProvider {}
