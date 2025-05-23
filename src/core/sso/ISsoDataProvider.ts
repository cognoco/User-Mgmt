/**
 * SSO Data Provider Interface
 *
 * Defines the contract for persistence operations related to Single Sign-On (SSO).
 * This abstraction allows the service layer to remain database-agnostic.
 */
import type { SsoProvider, SsoProviderPayload } from './models';

export interface ISsoDataProvider {
  /**
   * Retrieve all active SSO providers for an organization.
   *
   * @param organizationId ID of the organization
   * @returns Array of SSO providers
   */
  listProviders(organizationId: string): Promise<SsoProvider[]>;

  /**
   * Create or update an SSO provider configuration.
   *
   * @param payload Provider configuration data
   * @returns Result object with success flag and provider or error
   */
  upsertProvider(
    payload: SsoProviderPayload
  ): Promise<{ success: boolean; provider?: SsoProvider; error?: string }>;

  /**
   * Get a specific SSO provider by ID.
   *
   * @param organizationId ID of the organization
   * @param providerId ID of the provider
   * @returns The provider or null if not found
   */
  getProvider(
    organizationId: string,
    providerId: string
  ): Promise<SsoProvider | null>;

  /**
   * Delete an SSO provider by ID.
   *
   * @param providerId ID of the provider to delete
   * @returns Result object with success flag or error
   */
  deleteProvider(providerId: string): Promise<{ success: boolean; error?: string }>;
}
