import type { IUserRepository } from '@/core/user/IUserRepository';
import type { BaseDatabaseInterface } from '@/core/database/interfaces/base.interface';
import type { UserProfile } from '@/core/user/models';

/**
 * Database interface for user entities.
 *
 * This simply extends the existing {@link IUserRepository}
 * to make it part of the generic database interface collection.
 */
export interface UserDatabaseInterface
  extends BaseDatabaseInterface<UserProfile>, IUserRepository {}
