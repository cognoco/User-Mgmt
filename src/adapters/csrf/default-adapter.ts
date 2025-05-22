import { randomBytes } from 'crypto';
import { CsrfDataProvider } from './interfaces';

export class DefaultCsrfProvider implements CsrfDataProvider {
  async generateToken(): Promise<string> {
    return randomBytes(32).toString('hex');
  }
}
