import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PATCH } from '../route';
import {
  configureServices,
  resetServiceContainer,
} from '@/lib/config/service-container';
import type { UserService } from '@/core/user/interfaces';
import type { AuthService } from '@/core/auth/interfaces';
import createMockUserService from '@/tests/mocks/user.service.mock';
import { createAuthenticatedRequest } from '@/tests/utils/request-helpers';

// Mock the service error handler to avoid compliance config issues
vi.mock('@/services/common/service-error-handler', () => ({
  logServiceError: vi.fn(),
  handleServiceError: vi.fn(),
  withErrorHandling: vi.fn((fn) => fn),
  safeQuery: vi.fn(),
  validateAndExecute: vi.fn(),
}));

const service: UserService = createMockUserService();
const authService: Partial<AuthService> = { getCurrentUser: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  resetServiceContainer();
  (authService.getCurrentUser as any).mockResolvedValue({ id: 'user-1' });
  configureServices({
    userService: service,
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
    expect(service.getUserPreferences).toHaveBeenCalledWith('user-1');
  });
});

describe('/api/settings PATCH', () => {
  it('updates user settings', async () => {
    const req = createAuthenticatedRequest('PATCH', 'http://localhost/api/settings', { notifications: { email: false } });
    (req as any).json = async () => ({ notifications: { email: false } });
    const res = await PATCH(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(service.updateUserPreferences).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        notifications: expect.objectContaining({ email: false }),
      })
    );
    expect(body.data.notifications.email).toBe(true); // from mock
  });

  it('returns 500 on failure', async () => {
    (service.updateUserPreferences as vi.Mock).mockResolvedValueOnce({ success: false, error: 'fail' });
    const req = createAuthenticatedRequest('PATCH', 'http://localhost/api/settings', { notifications: { email: false } });
    (req as any).json = async () => ({ notifications: { email: false } });
    const res = await PATCH(req);
    expect(res.status).toBe(500);
  });
});
