/**
 * Organization Service Factory for API routes.
 *
 * Provides a configured {@link OrganizationService} instance used across API
 * routes. The service instance is cached and can be reset between tests.
 */
import type { OrganizationService } from '@/core/organization/interfaces';
import type { IOrganizationDataProvider } from '@/core/organization/IOrganizationDataProvider';
import { AdapterRegistry } from '@/adapters/registry';
import { getServiceContainer } from '@/lib/config/serviceContainer';
import { DefaultOrganizationService } from '@/services/organization/defaultOrganization.service';

/** Options for {@link getApiOrganizationService}. */
export interface ApiOrganizationServiceOptions {
  /** When true, clears any cached instance (useful for testing). */
  reset?: boolean;
}

let organizationServiceInstance: OrganizationService | null = null;
let constructing = false;

/**
 * Get a configured organization service instance for API routes.
 */
export function getApiOrganizationService(
  options: ApiOrganizationServiceOptions = {}
): OrganizationService {
  if (options.reset) {
    organizationServiceInstance = null;
  }

  if (!organizationServiceInstance && !constructing) {
    constructing = true;
    try {
      const containerService = getServiceContainer().organization;
      if (containerService) {
        organizationServiceInstance = containerService;
      }
    } finally {
      constructing = false;
    }
  }

  if (!organizationServiceInstance) {
    const provider = AdapterRegistry.getInstance().getAdapter<IOrganizationDataProvider>('organization');
    organizationServiceInstance = new DefaultOrganizationService(provider);
  }

  return organizationServiceInstance;
}
