import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { getApiAuthService } from '@/services/auth/factory';

vi.mock('@/services/auth/factory', () => ({ getApiAuthService: vi.fn() }));
vi.mock('@/middleware/with-auth-rate-limit', () => ({
  withAuthRateLimit: vi.fn((_req, handler) => handler(_req))
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
