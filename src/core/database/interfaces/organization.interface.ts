import type { IOrganizationDataProvider } from '@/src/core/organization/IOrganizationDataProvider'0;
import type { BaseDatabaseInterface } from '@/src/core/database/interfaces/base.interface'96;
import type { Organization } from '@/src/core/organization/models'160;

/**
 * Database interface for organizations.
 */
export interface OrganizationDatabaseInterface
  extends BaseDatabaseInterface<Organization>, IOrganizationDataProvider {}
