/**
 * SSO Data Provider Interface
 *
 * This interface abstracts the database/API layer for SSO operations,
 * following the adapter pattern from the architecture guidelines.
 */

import { SsoProvider, SsoProviderPayload } from '../../core/sso/models';

export interface SsoDataProvider {
  /**
   * List active SSO providers for an organization
   */
  listProviders(organizationId: string): Promise<SsoProvider[]>;

  /**
   * Create or update an SSO provider
   */
  upsertProvider(payload: SsoProviderPayload): Promise<SsoProvider>;
}
