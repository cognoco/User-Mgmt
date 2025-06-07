import type { IOrganizationDataProvider } from '@/src/core/organization/IOrganizationDataProvider';
import type { BaseDatabaseInterface } from '@/src/core/database/interfaces/base.interface';
import type { Organization } from '@/src/core/organization/models';

/**
 * Database interface for organizations.
 */
export interface OrganizationDatabaseInterface
  extends BaseDatabaseInterface<Organization>, IOrganizationDataProvider {}
