import type { IOrganizationDataProvider } from '../../organization/IOrganizationDataProvider';
import type { BaseDatabaseInterface } from './base.interface';
import type { Organization } from '../../organization/models';

/**
 * Database interface for organizations.
 */
export interface OrganizationDatabaseInterface
  extends BaseDatabaseInterface<Organization>, IOrganizationDataProvider {}
