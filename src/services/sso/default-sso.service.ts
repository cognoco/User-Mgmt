/**
 * Default SSO Service Implementation
 */

import { SsoService } from '@/core/sso/interfaces';
import { SsoDataProvider } from '@/core/sso/ISsoDataProvider';
import { SsoProvider, SsoProviderPayload } from '@/core/sso/models';

export class DefaultSsoService implements SsoService {
  constructor(private readonly provider: SsoDataProvider) {}

  async getProviders(organizationId: string): Promise<SsoProvider[]> {
    return this.provider.listProviders(organizationId);
  }

  async upsertProvider(payload: SsoProviderPayload): Promise<{ success: boolean; provider?: SsoProvider; error?: string }> {
    return this.provider.upsertProvider(payload);
  }

  async getProvider(organizationId: string, providerId: string): Promise<SsoProvider | null> {
    return this.provider.getProvider(organizationId, providerId);
  }

  async deleteProvider(providerId: string): Promise<{ success: boolean; error?: string }> {
    return this.provider.deleteProvider(providerId);
  }
}
