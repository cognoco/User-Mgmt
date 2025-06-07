import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@app/api/auth/mfa/enable/route';
import { getApiAuthService } from '@/services/auth/factory';
import { createRateLimit } from '@/middleware/rateLimit';

vi.mock('@/services/auth/factory', () => ({ getApiAuthService: vi.fn() }));
vi.mock('@/middleware/rate-limit', () => ({
  createRateLimit: vi.fn(() => vi.fn((_req: any, h: any) => h(_req)))
}));
vi.mock('@/middleware/with-security', () => ({
  withSecurity: (handler: any) => handler
}));

describe('POST /api/auth/mfa/enable', () => {
  const mockAuthService = { setupMFA: vi.fn() };
  const createRequest = () => new Request('http://localhost/api/auth/mfa/enable', { method: 'POST' });

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuthService as unknown as vi.Mock).mockReturnValue(mockAuthService);
    mockAuthService.setupMFA.mockResolvedValue({ success: true });
  });

  it('returns success when MFA enabled', async () => {
    const res = await POST(createRequest() as any);
    expect(res.status).toBe(200);
  });
});
