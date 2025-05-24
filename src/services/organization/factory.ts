import type { OrganizationService } from '@/core/organization/interfaces';
import type { IOrganizationDataProvider } from '@/core/organization/IOrganizationDataProvider';
import { AdapterRegistry } from '@/adapters/registry';
import { DefaultOrganizationService } from './default-organization.service';

export function getApiOrganizationService(): OrganizationService {
  const provider = AdapterRegistry.getInstance().getAdapter<IOrganizationDataProvider>('organization');
  return new DefaultOrganizationService(provider);
}
