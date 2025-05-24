import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from '../route';
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

describe('DELETE /api/auth/delete-account', () => {
  const mockAuthService = { deleteAccount: vi.fn() };
  const createRequest = (password?: string) => new Request('http://localhost/api/auth/delete-account', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: password ? JSON.stringify({ password }) : undefined
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuthService as unknown as vi.Mock).mockReturnValue(mockAuthService);
    mockAuthService.deleteAccount.mockResolvedValue(undefined);
  });

  it('returns 400 when password missing', async () => {
    const res = await DELETE(createRequest() as any);
    expect(res.status).toBe(400);
  });

  it('calls service and returns success', async () => {
    const res = await DELETE(createRequest('pass') as any);
    expect(res.status).toBe(200);
    expect(mockAuthService.deleteAccount).toHaveBeenCalledWith('pass');
  });
});
