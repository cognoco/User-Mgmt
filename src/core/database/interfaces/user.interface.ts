import type { IUserRepository } from '@/src/core/user/IUserRepository';
import type { BaseDatabaseInterface } from '@/src/core/database/interfaces/base.interface';
import type { UserProfile } from '@/src/core/user/models';

/**
 * Database interface for user entities.
 *
 * This simply extends the existing {@link IUserRepository}
 * to make it part of the generic database interface collection.
 */
export interface UserDatabaseInterface
  extends BaseDatabaseInterface<UserProfile>, IUserRepository {}
