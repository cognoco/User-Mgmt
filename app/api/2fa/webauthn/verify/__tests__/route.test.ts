import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { generateAuthentication, verifyAuthentication } from '@/lib/webauthn/webauthn.service';
import { logUserAction } from '@/lib/audit/auditLogger';

vi.mock('@/lib/webauthn/webauthn.service', () => ({
  generateAuthentication: vi.fn(),
  verifyAuthentication: vi.fn()
}));
vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));
vi.mock('@/middleware/createMiddlewareChain', async () => {
  const actual = await vi.importActual<any>('@/middleware/createMiddlewareChain');
  return {
    ...actual,
    // Pass-through validation middleware using actual schema parsing
    validationMiddleware: (schema: any) => (handler: any) => async (req: any, ctx?: any) => {
      const body = await req.json();
      const parsed = schema.parse(body);
      return handler(req, ctx, parsed);
    },
  };
});
vi.mock('@/lib/audit/auditLogger', () => ({ logUserAction: vi.fn() }));

const createRequest = (body: any) =>
  new Request('http://localhost/api/2fa/webauthn/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'test' },
    body: JSON.stringify(body)
  });

describe('WebAuthn verify API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns authentication options', async () => {
    vi.mocked(generateAuthentication).mockResolvedValue({ challenge: 'c' } as any);
    const res = await POST(createRequest({ phase: 'options', userId: 'u1' }) as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.challenge).toBe('c');
    expect(generateAuthentication).toHaveBeenCalledWith('u1');
  });

  it('verifies authentication', async () => {
    vi.mocked(verifyAuthentication).mockResolvedValue({ verified: true } as any);
    const res = await POST(
      createRequest({ phase: 'verification', userId: 'u1', credential: 'cred' }) as any
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.verified).toBe(true);
    expect(data.user.id).toBe('u1');
    expect(verifyAuthentication).toHaveBeenCalledWith('u1', 'cred');
  });
});
