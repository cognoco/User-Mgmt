import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/auth/factory', () => ({
  getApiAuthService: vi.fn(),
}));

const mockService = {
  getCurrentUser: vi.fn(),
};

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('E2E_TEST', 'false');
  const mod = await import('@/services/auth/factory');
  (mod.getApiAuthService as any).mockReturnValue(mockService);
  delete (globalThis as any).__UM_GET_USER_CACHE__;
});

describe('getUser', () => {
  it('returns mock user in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { getUser } = await import('../getUser');
    const user = await getUser();
    expect(user?.id).toBe('mock-user-id');
  });

  it('returns user from auth service and caches result', async () => {
    const mockUser = { id: '1', email: 'a@test.com' } as any;
    mockService.getCurrentUser.mockResolvedValue(mockUser);
    const { getUser } = await import('../getUser');
    const first = await getUser();
    const second = await getUser();
    expect(first).toEqual(mockUser);
    expect(second).toEqual(mockUser);
    expect(mockService.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('handles errors and returns null', async () => {
    mockService.getCurrentUser.mockRejectedValue(new Error('fail'));
    const { getUser } = await import('../getUser');
    const user = await getUser();
    expect(user).toBeNull();
  });
});
