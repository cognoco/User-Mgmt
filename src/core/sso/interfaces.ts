/**
 * SSO Service Interface
 *
 * This file defines the core interfaces for the SSO domain.
 */

import { SsoProvider, SsoProviderPayload } from './models';

/**
 * SSO service interface used by the API layer and hooks
 */
export interface SsoService {
  /**
   * Get all active SSO providers for an organization
   */
  getProviders(organizationId: string): Promise<SsoProvider[]>;

  /**
   * Create or update an SSO provider for an organization
   */
  upsertProvider(payload: SsoProviderPayload): Promise<SsoProvider>;
}
