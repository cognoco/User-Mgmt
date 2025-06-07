import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST, DELETE } from '@app/api/profile/avatar/route';
import { configureServices, resetServiceContainer } from '@/lib/config/serviceContainer';
import type { UserService } from '@/core/user/interfaces';
import type { AuthService } from '@/core/auth/interfaces';
import createMockUserService from '@/tests/mocks/user.service.mock';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers';

vi.mock('@/services/user/factory', () => ({}));
vi.mock('@/services/auth/factory', () => ({}));

const userService = createMockUserService();
const authService: Partial<AuthService> = {
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'user-1', email: 'u@test.com' }),
};

beforeEach(() => {
  vi.clearAllMocks();
  resetServiceContainer();
  configureServices({
    userService: userService as UserService,
    authService: authService as AuthService,
  });
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
    expect(userService.updateUserProfile).toHaveBeenCalled();
  });

  it('uploads custom avatar', async () => {
    const data = 'data:image/png;base64,aGVsbG8=';
    const req = createAuthenticatedRequest('POST', 'http://localhost/api/profile/avatar', { avatar: data });
    (req as any).json = async () => ({ avatar: data });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(userService.uploadProfilePicture).toHaveBeenCalled();
  });

  it('deletes avatar', async () => {
    const req = createAuthenticatedRequest('DELETE', 'http://localhost/api/profile/avatar');
    const res = await DELETE(req);
    expect(res.status).toBe(204);
    expect(userService.deleteProfilePicture).toHaveBeenCalled();
  });
});
