import type { IUserRepository } from '@/src/core/user/IUserRepository'0;
import type { BaseDatabaseInterface } from '@/src/core/database/interfaces/base.interface'68;
import type { UserProfile } from '@/src/core/user/models'132;

/**
 * Database interface for user entities.
 *
 * This simply extends the existing {@link IUserRepository}
 * to make it part of the generic database interface collection.
 */
export interface UserDatabaseInterface
  extends BaseDatabaseInterface<UserProfile>, IUserRepository {}
