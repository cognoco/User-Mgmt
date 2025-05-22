import { CsrfService } from '@/core/csrf/interfaces';

export class BrowserCsrfService implements CsrfService {
  constructor(private endpoint = '/api/csrf') {}

  async generateToken() {
    const res = await fetch(this.endpoint, { credentials: 'include' });
    if (!res.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    const data = await res.json();
    if (!data.csrfToken) {
      throw new Error('Invalid CSRF token response');
    }
    return { token: data.csrfToken as string };
  }
}
