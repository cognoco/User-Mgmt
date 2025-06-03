import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST, DELETE } from '../route';
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

describe('/api/profile/avatar', () => {
  it('returns predefined avatars', async () => {
    const req = createAuthenticatedRequest('GET', 'http://localhost/api/profile/avatar');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(body.data.avatars)).toBe(true);
  });

  it('updates avatar using predefined id', async () => {
    const req = createAuthenticatedRequest('POST', 'http://localhost/api/profile/avatar', { avatarId: 'avatar1' });
    (req as any).json = async () => ({ avatarId: 'avatar1' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(service.updateUserProfile).toHaveBeenCalled();
  });

  it('uploads custom avatar', async () => {
    const data = 'data:image/png;base64,aGVsbG8=';
    const req = createAuthenticatedRequest('POST', 'http://localhost/api/profile/avatar', { avatar: data });
    (req as any).json = async () => ({ avatar: data });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(service.uploadProfilePicture).toHaveBeenCalled();
  });

  it('deletes avatar', async () => {
    const req = createAuthenticatedRequest('DELETE', 'http://localhost/api/profile/avatar');
    const res = await DELETE(req);
    expect(res.status).toBe(204);
    expect(service.deleteProfilePicture).toHaveBeenCalled();
  });
});
