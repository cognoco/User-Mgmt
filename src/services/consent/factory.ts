/**
 * Consent Service Factory for API routes.
 *
 * Returns a configured {@link ConsentService} instance. The instance is cached
 * and can be reset, allowing tests to run in isolation.
 */
import { ConsentService } from '@/core/consent/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { IConsentDataProvider } from '@/core/consent';
import { AdapterRegistry } from '@/adapters/registry';
import { getServiceContainer } from '@/lib/config/serviceContainer';
import { DefaultConsentService } from '@/services/consent/defaultConsent.service';

/** Options for {@link getApiConsentService}. */
export interface ApiConsentServiceOptions {
  /** When true, clears the cached instance. */
  reset?: boolean;
}

let consentServiceInstance: ConsentService | null = null;
let constructing = false;

export function getApiConsentService(
  options: ApiConsentServiceOptions = {}
): ConsentService {
  if (options.reset) {
    consentServiceInstance = null;
  }

  if (!consentServiceInstance && !constructing) {
    constructing = true;
    try {
      const containerService = getServiceContainer().consent;
      if (containerService) {
        consentServiceInstance = containerService;
      }
    } finally {
      constructing = false;
    }
  }

  if (!consentServiceInstance) {
    consentServiceInstance = UserManagementConfiguration.getServiceProvider('consentService') as ConsentService | undefined;
    if (!consentServiceInstance) {
      const provider = AdapterRegistry.getInstance().getAdapter<IConsentDataProvider>('consent');
      consentServiceInstance = new DefaultConsentService(provider);
    }
  }
  return consentServiceInstance;
}
