import { CsrfService } from '@/core/csrf/interfaces';
import type { CsrfDataProvider } from '@/core/csrf/ICsrfDataProvider';

export class BrowserCsrfService implements CsrfService {
  constructor(private provider: CsrfDataProvider) {}

  async generateToken() {
    const token = await this.provider.generateToken();
    return { token };
  }
}
