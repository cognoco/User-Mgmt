import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PATCH } from '../route';
import { getApiUserService } from '@/services/user/factory';
import { createAuthMiddleware } from '@/lib/auth/unified-auth.middleware';
import createMockUserService from '@/tests/mocks/user.service.mock';
import { createAuthenticatedRequest } from '@/tests/utils/request-helpers';

vi.mock('@/services/user/factory', () => ({ getApiUserService: vi.fn() }));
vi.mock('@/lib/auth/unified-auth.middleware', () => ({
  createAuthMiddleware: vi.fn(() =>
    (handler: any) => async (req: any) => handler(req, { userId: 'user-1', permissions: [], authenticated: true })
  )
}));

const service = createMockUserService();

beforeEach(() => {
  vi.clearAllMocks();
  (getApiUserService as unknown as vi.Mock).mockReturnValue(service);
});

describe('/api/profile GET', () => {
  it('returns user profile', async () => {
    const req = createAuthenticatedRequest('GET', 'http://localhost/api/profile');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(service.getUserProfile).toHaveBeenCalledWith('user-1');
    expect(data.data.id).toBe('user-1');
  });

  it('returns 404 when profile missing', async () => {
    (service.getUserProfile as vi.Mock).mockResolvedValueOnce(null);
    const req = createAuthenticatedRequest('GET', 'http://localhost/api/profile');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data).toBeNull();
  });
});

describe('/api/profile PATCH', () => {
  it('updates user profile', async () => {
    const req = createAuthenticatedRequest('PATCH', 'http://localhost/api/profile', { bio: 'Updated bio' });
    (req as any).json = async () => ({ bio: 'Updated bio' });
    const res = await PATCH(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(service.updateUserProfile).toHaveBeenCalledWith('user-1', {
      bio: 'Updated bio',
    });
    expect(data.data.bio).toBe('Updated bio');
  });

  it('returns 500 when update fails', async () => {
    (service.updateUserProfile as vi.Mock).mockResolvedValueOnce({ success: false, error: 'fail' });
    const req = createAuthenticatedRequest('PATCH', 'http://localhost/api/profile', { name: 'Bad' });
    (req as any).json = async () => ({ name: 'Bad' });
    const res = await PATCH(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data).toBeUndefined();
  });
});
