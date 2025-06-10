/**
 * SSO Service Factory
 */

import { AxiosInstance } from 'axios';
import { SsoService } from '@/core/sso/interfaces';
import { DefaultSsoService } from '@/services/sso/defaultSso.service';
import { SsoDataProvider } from '@/core/sso/ISsoDataProvider';

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
