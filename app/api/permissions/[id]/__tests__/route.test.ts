import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT } from '@/app/api/permissions/[id]/route';
import { configureServices, resetServiceContainer } from '@/lib/config/serviceContainer';
import type { AuthService } from '@/core/auth/interfaces';
import type { PermissionService } from '@/core/permission/interfaces';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers';

const mockPermission: Partial<PermissionService> = { getAllPermissions: vi.fn() };
const mockAuth: Partial<AuthService> = { getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }) };

beforeEach(() => {
  vi.resetAllMocks();
  resetServiceContainer();
  configureServices({ permissionService: mockPermission as PermissionService, authService: mockAuth as AuthService });
});

describe('permission id API', () => {
  it('returns details for valid permission', async () => {
    const res = await GET(createAuthenticatedRequest('GET', 'http://test/api/permissions/VIEW_PROJECTS'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.id).toBe('VIEW_PROJECTS');
  });

  it('PUT not allowed', async () => {
    const res = await PUT(createAuthenticatedRequest('PUT', 'http://test/api/permissions/VIEW_PROJECTS'));
    expect(res.status).toBe(405);
  });
});
