import { describe, it, expect } from 'vitest';
import { GET, POST } from '../route';

const mockRequest = (body: any) => new Request('http://localhost', { method: 'POST', body: JSON.stringify(body) });

describe('/api/sso', () => {
  it('GET returns providers array', async () => {
    const res = await GET();
    const json = await res.json();
    expect(Array.isArray(json.providers)).toBe(true);
  });

  it('POST returns success for valid input', async () => {
    const req = mockRequest({ provider: 'google', config: { clientId: 'abc' } });
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.provider.provider).toBe('google');
  });

  it('POST returns 400 for invalid input', async () => {
    const req = mockRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
}); 