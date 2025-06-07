import type { IOrganizationDataProvider } from '@/core/organization/IOrganizationDataProvider';
import type { BaseDatabaseInterface } from '@/core/database/interfaces/base.interface';
import type { Organization } from '@/core/organization/models';

/**
 * Database interface for organizations.
 */
export interface OrganizationDatabaseInterface
  extends BaseDatabaseInterface<Organization>, IOrganizationDataProvider {}
