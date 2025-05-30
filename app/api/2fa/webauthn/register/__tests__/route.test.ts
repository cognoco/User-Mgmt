import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { generateRegistration, verifyRegistration } from '@/lib/webauthn/webauthn.service';
import { logUserAction } from '@/lib/audit/auditLogger';

vi.mock('@/lib/webauthn/webauthn.service', () => ({
  generateRegistration: vi.fn(),
  verifyRegistration: vi.fn()
}));
vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));
vi.mock('@/middleware/createMiddlewareChain', async () => {
  const actual = await vi.importActual<any>('@/middleware/createMiddlewareChain');
  return {
    ...actual,
    routeAuthMiddleware: vi.fn(() => (handler: any) =>
      (req: any, _ctx?: any, data?: any) => handler(req, { userId: 'u1' }, data)
    ),
  };
});
vi.mock('@/lib/audit/auditLogger', () => ({ logUserAction: vi.fn() }));

const createRequest = (body: any) =>
  new Request('http://localhost/api/2fa/webauthn/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'test' },
    body: JSON.stringify(body)
  });

describe('WebAuthn register API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns registration options', async () => {
    vi.mocked(generateRegistration).mockResolvedValue({ challenge: 'c' } as any);
    const res = await POST(createRequest({ phase: 'options' }) as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.challenge).toBe('c');
    expect(generateRegistration).toHaveBeenCalledWith('u1');
  });

  it('verifies registration', async () => {
    vi.mocked(verifyRegistration).mockResolvedValue({ verified: true } as any);
    const res = await POST(
      createRequest({ phase: 'verification', credential: 'cred' }) as any
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.verified).toBe(true);
    expect(verifyRegistration).toHaveBeenCalledWith('u1', 'cred');
  });
});
