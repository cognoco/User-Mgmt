import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PATCH } from '@app/api/settings/route';
import { configureServices, resetServiceContainer } from '@/lib/config/serviceContainer';
import type { UserService } from '@/core/user/interfaces';
import type { AuthService } from '@/core/auth/interfaces';
import createMockUserService from '@/tests/mocks/user.service.mock';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers';

vi.mock('@/services/user/factory', () => ({}));
vi.mock('@/services/auth/factory', () => ({}));

const userService = createMockUserService();
const authService: Partial<AuthService> = {
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'user-1', email: 'user@test.com' }),
};

beforeEach(() => {
  vi.clearAllMocks();
  resetServiceContainer();
  configureServices({
    userService: userService as UserService,
    authService: authService as AuthService,
  });
});

describe('/api/settings GET', () => {
  it('returns user settings', async () => {
    const req = createAuthenticatedRequest('GET', 'http://localhost/api/settings');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.notifications.email).toBe(true);
    expect(userService.getUserPreferences).toHaveBeenCalledWith('user-1');
  });
});

describe('/api/settings PATCH', () => {
  it('updates user settings', async () => {
    const req = createAuthenticatedRequest('PATCH', 'http://localhost/api/settings', { notifications: { email: false } });
    (req as any).json = async () => ({ notifications: { email: false } });
    const res = await PATCH(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(userService.updateUserPreferences).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        notifications: expect.objectContaining({ email: false }),
      })
    );
    expect(body.data.notifications.email).toBe(true); // from mock
  });

  it('returns 500 on failure', async () => {
    (userService.updateUserPreferences as vi.Mock).mockResolvedValueOnce({ success: false, error: 'fail' });
    const req = createAuthenticatedRequest('PATCH', 'http://localhost/api/settings', { notifications: { email: false } });
    (req as any).json = async () => ({ notifications: { email: false } });
    const res = await PATCH(req);
    expect(res.status).toBe(500);
  });
});
