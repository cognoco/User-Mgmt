import { ConsentService } from '@/core/consent/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { IConsentDataProvider } from '@/core/consent';
import { AdapterRegistry } from '@/adapters/registry';
import { DefaultConsentService } from './default-consent.service';

let consentServiceInstance: ConsentService | null = null;

export function getApiConsentService(): ConsentService {
  if (!consentServiceInstance) {
    consentServiceInstance = UserManagementConfiguration.getServiceProvider('consentService') as ConsentService | undefined;
    if (!consentServiceInstance) {
      const provider = AdapterRegistry.getInstance().getAdapter<IConsentDataProvider>('consent');
      consentServiceInstance = new DefaultConsentService(provider);
    }
  }
  return consentServiceInstance;
}
