import { CsrfService } from '@/core/csrf/interfaces';
import { CsrfToken } from '@/core/csrf/models';
import type { CsrfDataProvider } from '@/core/csrf/ICsrfDataProvider';

export class DefaultCsrfService implements CsrfService {
  constructor(private csrfProvider: CsrfDataProvider) {}

  async generateToken(): Promise<CsrfToken> {
    const token = await this.csrfProvider.generateToken();
    return { token };
  }
}
