import { randomBytes } from 'crypto';
import type { ICsrfDataProvider } from '@/core/csrf/ICsrfDataProvider';
import type { CsrfToken } from '@/core/csrf/models';

export class DefaultCsrfProvider implements ICsrfDataProvider {
  private tokens = new Set<string>();

  async createToken(): Promise<{ success: boolean; token?: CsrfToken; error?: string }> {
    const token = randomBytes(32).toString('hex');
    this.tokens.add(token);
    return { success: true, token: { token } };
  }

  async validateToken(token: string): Promise<{ valid: boolean; error?: string }> {
    return { valid: this.tokens.has(token) };
  }

  async revokeToken(token: string): Promise<{ success: boolean; error?: string }> {
    const existed = this.tokens.delete(token);
    return { success: existed };
  }
}
