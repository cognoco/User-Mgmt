import { CsrfService } from '@/core/csrf/interfaces';
import type { CsrfToken } from '@/core/csrf/models';
import type { CsrfDataProvider } from '@/core/csrf/ICsrfDataProvider';

export class DefaultCsrfService implements CsrfService {
  constructor(private provider: CsrfDataProvider) {}

  async createToken(): Promise<{ success: boolean; token?: CsrfToken; error?: string }> {
    return this.provider.createToken();
  }

  async validateToken(token: string): Promise<{ valid: boolean; error?: string }> {
    return this.provider.validateToken(token);
  }

  async revokeToken(token: string): Promise<{ success: boolean; error?: string }> {
    return this.provider.revokeToken(token);
  }
}
