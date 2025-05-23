import { randomBytes } from 'crypto';
import type { ICsrfDataProvider } from '@/core/csrf/ICsrfDataProvider';

export class DefaultCsrfProvider implements ICsrfDataProvider {
  async generateToken(): Promise<string> {
    return randomBytes(32).toString('hex');
  }
}
