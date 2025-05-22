/**
 * Default SSO Service Implementation
 */

import { SsoService } from '@/core/sso/interfaces';
import { SsoDataProvider } from '@/adapters/sso/interfaces';
import { SsoProvider, SsoProviderPayload } from '@/core/sso/models';

export class DefaultSsoService implements SsoService {
  constructor(private readonly provider: SsoDataProvider) {}

  async getProviders(organizationId: string): Promise<SsoProvider[]> {
    return this.provider.listProviders(organizationId);
  }

  async upsertProvider(payload: SsoProviderPayload): Promise<SsoProvider> {
    return this.provider.upsertProvider(payload);
  }
}
