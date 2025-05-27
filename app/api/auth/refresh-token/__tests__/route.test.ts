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

describe('POST /api/auth/refresh-token', () => {
  const mockAuthService = { refreshToken: vi.fn() };
  const createRequest = () => new Request('http://localhost/api/auth/refresh-token', { method: 'POST' });

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuthService as unknown as vi.Mock).mockReturnValue(mockAuthService);
    mockAuthService.refreshToken.mockResolvedValue(true);
  });

  it('returns success when token is refreshed', async () => {
    const res = await POST(createRequest() as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.success).toBe(true);
    expect(mockAuthService.refreshToken).toHaveBeenCalled();
  });

  it('redirects to login when refresh fails', async () => {
    mockAuthService.refreshToken.mockResolvedValue(false);
    const res = await POST(createRequest() as any);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('http://localhost/login');
  });
});
