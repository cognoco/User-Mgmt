import { CsrfService } from '@/core/csrf/interfaces';
import { DefaultCsrfService } from './default-csrf.service';
import type { CsrfDataProvider } from '@/adapters/csrf/interfaces';

export interface CsrfServiceConfig {
  csrfDataProvider: CsrfDataProvider;
}

export function createCsrfService(config: CsrfServiceConfig): CsrfService {
  return new DefaultCsrfService(config.csrfDataProvider);
}

export default { createCsrfService };
