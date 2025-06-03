import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DELETE, GET } from '../route';
import { getApiAuthService } from '@/services/auth/factory';
import { createAuthMiddleware } from '@/lib/auth/unified-auth.middleware';
import { createAuthenticatedRequest } from '@/tests/utils/request-helpers';

vi.mock('@/services/auth/factory', () => ({ getApiAuthService: vi.fn() }));
vi.mock('@/lib/auth/unified-auth.middleware', () => ({
  createAuthMiddleware: vi.fn(() =>
    (handler: any) => async (req: any) => handler(req, { userId: 'u1', permissions: [], authenticated: true })
  )
}));

const service = {
  getCurrentUser: vi.fn(),
  deleteAccount: vi.fn(),
  getUserAccount: vi.fn()
};

beforeEach(() => {
  vi.clearAllMocks();
  (getApiAuthService as unknown as vi.Mock).mockReturnValue(service);
  service.getCurrentUser.mockResolvedValue({ id: 'u1', email: 'a@test.com' });
  service.deleteAccount.mockResolvedValue({ success: true });
  service.getUserAccount.mockResolvedValue({ id: 'u1', email: 'a@test.com' });
});

describe('DELETE /api/auth/account', () => {
  it('deletes account successfully', async () => {
    const req = createAuthenticatedRequest('DELETE', 'http://localhost/api/auth/account', { password: 'p' });
    (req as any).json = async () => ({ password: 'p' });
    const res = await DELETE(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.message).toBeDefined();
    expect(service.deleteAccount).toHaveBeenCalledWith({ userId: 'u1', password: 'p' });
  });

  it('returns 401 on invalid password', async () => {
    service.deleteAccount.mockResolvedValueOnce({ success: false, error: 'INVALID_PASSWORD' });
    const req = createAuthenticatedRequest('DELETE', 'http://localhost/api/auth/account', { password: 'bad' });
    (req as any).json = async () => ({ password: 'bad' });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/account', () => {
  it('returns account info', async () => {
    const req = createAuthenticatedRequest('GET', 'http://localhost/api/auth/account');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.id).toBe('u1');
    expect(service.getUserAccount).toHaveBeenCalledWith('u1');
  });
});
