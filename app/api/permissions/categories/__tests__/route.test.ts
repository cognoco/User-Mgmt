import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { configureServices, resetServiceContainer } from '@/lib/config/service-container';
import type { PermissionService } from '@/core/permission/interfaces';
import type { AuthService } from '@/core/auth/interfaces';
import { createAuthenticatedRequest } from '@/tests/utils/request-helpers';

const mockPermission: Partial<PermissionService> = { getAllPermissions: vi.fn() };
const mockAuth: Partial<AuthService> = { getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }) };

beforeEach(() => {
  vi.resetAllMocks();
  resetServiceContainer();
  configureServices({ permissionService: mockPermission as PermissionService, authService: mockAuth as AuthService });
});

describe('permission categories API', () => {
  it('returns category list', async () => {
    const res = await GET(createAuthenticatedRequest('GET', 'http://test'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data.categories)).toBe(true);
    expect(body.data.categories.length).toBeGreaterThan(0);
  });
});
