/**
 * Default SSO Service Implementation
 */

import { SsoService } from '@/core/sso/interfaces';
import { SsoDataProvider } from '@/core/sso/ISsoDataProvider';
import { SsoProvider, SsoProviderPayload } from '@/core/sso/models';
import { translateError } from '@/lib/utils/error';
import { logServiceError } from '@/services/common/serviceErrorHandler';
import { translateSsoError } from '@/services/sso/errorMapper';

export class DefaultSsoService implements SsoService {
  constructor(private readonly provider: SsoDataProvider) {}

  async getProviders(organizationId: string): Promise<SsoProvider[]> {
    try {
      return await this.provider.listProviders(organizationId);
    } catch (err) {
      const appErr = translateSsoError('discovery', err);
      logServiceError(appErr, {
        service: 'DefaultSsoService',
        method: 'getProviders',
        resourceType: 'organization',
        resourceId: organizationId,
      });
      return [];
    }
  }

  async upsertProvider(payload: SsoProviderPayload): Promise<{ success: boolean; provider?: SsoProvider; error?: string }> {
    try {
      const result = await this.provider.upsertProvider(payload);
      if (!result.success) {
        const appErr = translateSsoError('configuration', new Error(result.error || 'SSO provider error'));
        logServiceError(appErr, {
          service: 'DefaultSsoService',
          method: 'upsertProvider',
          resourceType: 'organization',
          resourceId: payload.organizationId,
        });
        return { success: false, error: translateError(appErr) };
      }
      return result;
    } catch (err) {
      const appErr = translateSsoError('configuration', err);
      logServiceError(appErr, {
        service: 'DefaultSsoService',
        method: 'upsertProvider',
        resourceType: 'organization',
        resourceId: payload.organizationId,
      });
      return { success: false, error: translateError(appErr) };
    }
  }

  async getProvider(organizationId: string, providerId: string): Promise<SsoProvider | null> {
    try {
      return await this.provider.getProvider(organizationId, providerId);
    } catch (err) {
      const appErr = translateSsoError('discovery', err);
      logServiceError(appErr, {
        service: 'DefaultSsoService',
        method: 'getProvider',
        resourceType: 'organization',
        resourceId: organizationId,
      });
      return null;
    }
  }

  async deleteProvider(providerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.provider.deleteProvider(providerId);
    } catch (err) {
      const appErr = translateSsoError('configuration', err);
      logServiceError(appErr, {
        service: 'DefaultSsoService',
        method: 'deleteProvider',
        resourceType: 'ssoProvider',
        resourceId: providerId,
      });
      return { success: false, error: translateError(appErr) };
    }
  }
}
