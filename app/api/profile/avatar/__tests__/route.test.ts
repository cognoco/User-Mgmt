import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST, DELETE } from '../route';
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
