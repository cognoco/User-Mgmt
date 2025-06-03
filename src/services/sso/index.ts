/**
 * SSO Service Factory
 */

import { AxiosInstance } from 'axios';
import { SsoService } from '@/core/sso/interfaces';
import { DefaultSsoService } from './default-sso.service';
import { SsoDataProvider } from '@/core/sso/ISsoDataProvider';
export { mapSsoProviderError } from './sso-error.mapper';

export interface SsoServiceConfig {
  apiClient: AxiosInstance;
  ssoDataProvider: SsoDataProvider;
}

export function createSsoService(config: SsoServiceConfig): SsoService {
  return new DefaultSsoService(config.ssoDataProvider);
}

export default {
  createSsoService,
};
