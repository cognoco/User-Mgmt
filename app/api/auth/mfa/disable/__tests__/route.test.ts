import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { getApiAuthService } from '@/services/auth/factory';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';

vi.mock('@/services/auth/factory', () => ({ getApiAuthService: vi.fn() }));
vi.mock('@/middleware/with-auth-rate-limit', () => ({
  withAuthRateLimit: vi.fn((_req, handler) => handler(_req))
}));
vi.mock('@/middleware/with-security', () => ({
  withSecurity: (handler: any) => handler
}));

describe('POST /api/auth/mfa/disable', () => {
  const mockAuthService = { disableMFA: vi.fn() };
  const createRequest = (code?: string) => new Request('http://localhost/api/auth/mfa/disable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: code ? JSON.stringify({ code }) : undefined
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuthService as unknown as vi.Mock).mockReturnValue(mockAuthService);
    mockAuthService.disableMFA.mockResolvedValue({ success: true });
  });

  it('returns 400 when code missing', async () => {
    const res = await POST(createRequest() as any);
    expect(res.status).toBe(400);
  });

  it('returns success when MFA disabled', async () => {
    const res = await POST(createRequest('123') as any);
    expect(res.status).toBe(200);
  });
});
