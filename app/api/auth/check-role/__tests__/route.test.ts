import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { configureServices, resetServiceContainer } from '@/lib/config/service-container';
import type { PermissionService } from '@/core/permission/interfaces';
import type { AuthService } from '@/core/auth/interfaces';
import { createAuthenticatedRequest } from '@/tests/utils/request-helpers';

vi.mock('@/services/permission/factory', () => ({}));
vi.mock('@/services/auth/factory', () => ({}));

const mockService: Partial<PermissionService> = { hasRole: vi.fn() };
const mockAuth: Partial<AuthService> = {
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }),
};

beforeEach(() => {
  vi.clearAllMocks();
  resetServiceContainer();
  configureServices({
    permissionService: mockService as PermissionService,
    authService: mockAuth as AuthService,
  });
  vi.mocked(mockService.hasRole!).mockResolvedValue(true);
});

function makeReq(body: any) {
  return createAuthenticatedRequest('POST', 'http://test/api/auth/check-role', body);
}

describe('POST /api/auth/check-role', () => {
  it('returns role result', async () => {
    const res = await POST(makeReq({ role: 'ADMIN' }) as any);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.hasRole).toBe(true);
    expect(mockService.hasRole).toHaveBeenCalledWith('u1', 'ADMIN');
  });

  it('validates body', async () => {
    const res = await POST(makeReq({}) as any);
    expect(res.status).toBe(400);
  });
});
