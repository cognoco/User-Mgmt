import { CsrfService } from '@/core/csrf/interfaces';
import { DefaultCsrfService } from '@/src/services/csrf/defaultCsrf.service';
import type { CsrfDataProvider } from '@/core/csrf/ICsrfDataProvider';
export { BrowserCsrfService } from '@/src/services/csrf/browserCsrf.service';

export interface CsrfServiceConfig {
  csrfDataProvider: CsrfDataProvider;
}

export function createCsrfService(config: CsrfServiceConfig): CsrfService {
  return new DefaultCsrfService(config.csrfDataProvider);
}

export default { createCsrfService };
