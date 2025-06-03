/**
 * Default SSO Service Implementation
 */

import { SsoService } from '@/core/sso/interfaces';
import { SsoDataProvider } from '@/core/sso/ISsoDataProvider';
import { SsoProvider, SsoProviderPayload } from '@/core/sso/models';
import { mapSsoProviderError } from './sso-error.mapper';
import { errorLogger } from '@/lib/monitoring/error-logger';

export class DefaultSsoService implements SsoService {
  constructor(private readonly provider: SsoDataProvider) {}

  async getProviders(organizationId: string): Promise<SsoProvider[]> {
    try {
      return await this.provider.listProviders(organizationId);
    } catch (err) {
      const appErr = mapSsoProviderError(err);
      errorLogger.logServiceError(appErr, { service: 'sso', action: 'listProviders' });
      throw appErr;
    }
  }

  async upsertProvider(payload: SsoProviderPayload): Promise<{ success: boolean; provider?: SsoProvider; error?: string }> {
    try {
      return await this.provider.upsertProvider(payload);
    } catch (err) {
      const appErr = mapSsoProviderError(err);
      errorLogger.logServiceError(appErr, { service: 'sso', action: 'upsertProvider' });
      throw appErr;
    }
  }

  async getProvider(organizationId: string, providerId: string): Promise<SsoProvider | null> {
    try {
      return await this.provider.getProvider(organizationId, providerId);
    } catch (err) {
      const appErr = mapSsoProviderError(err);
      errorLogger.logServiceError(appErr, { service: 'sso', action: 'getProvider' });
      throw appErr;
    }
  }

  async deleteProvider(providerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.provider.deleteProvider(providerId);
    } catch (err) {
      const appErr = mapSsoProviderError(err);
      errorLogger.logServiceError(appErr, { service: 'sso', action: 'deleteProvider' });
      throw appErr;
    }
  }
}
