import { CsrfToken } from './models';

export interface CsrfService {
  generateToken(): Promise<CsrfToken>;
}
