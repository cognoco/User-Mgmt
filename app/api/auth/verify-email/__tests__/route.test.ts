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

describe('POST /api/auth/verify-email', () => {
  const mockAuthService = { verifyEmail: vi.fn() };
  const createRequest = (token?: string) => new Request('http://localhost/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: token ? JSON.stringify({ token }) : undefined
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuthService as unknown as vi.Mock).mockReturnValue(mockAuthService);
    mockAuthService.verifyEmail.mockResolvedValue(undefined);
  });

  it('returns 400 when body is missing', async () => {
    const res = await POST(createRequest() as any);
    expect(res.status).toBe(400);
  });

  it('returns success when verification succeeds', async () => {
    const res = await POST(createRequest('abc') as any);
    expect(res.status).toBe(200);
    expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('abc');
  });
});
