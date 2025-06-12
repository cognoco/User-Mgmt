/* eslint-disable import/first */
import { vi } from 'vitest';

// Auth service & permission service container mocks
import { configureServices, resetServiceContainer } from '@/lib/config/serviceContainer';
import type { AuthService } from '@/core/auth/interfaces';
import type { PermissionService } from '@/core/permission/interfaces';

const mockPermission: Partial<PermissionService> = { getAllPermissions: vi.fn() };
const mockAuth: Partial<AuthService> = { getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }) };

beforeEach(() => {
  vi.resetAllMocks();
  resetServiceContainer();
  configureServices({ permissionService: mockPermission as PermissionService, authService: mockAuth as AuthService });
});

import { describe, it, expect } from 'vitest';
import { GET, PUT } from '@app/api/permissions/[id]/route';
import { callRouteWithParams } from 'tests/utils/callRoute';

const authHeaders = { authorization: 'Bearer test-token' };

describe('permission id API', () => {
  it('returns details for valid permission', async () => {
    const res = await callRouteWithParams(
      GET as any,
      { id: 'VIEW_PROJECTS' },
      'http://test/api/permissions/VIEW_PROJECTS',
      { headers: authHeaders },
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.id).toBe('VIEW_PROJECTS');
  });

  it('PUT not allowed', async () => {
    const res = await callRouteWithParams(
      PUT as any,
      { id: 'VIEW_PROJECTS' },
      'http://test/api/permissions/VIEW_PROJECTS',
      { method: 'PUT', headers: authHeaders },
    );
    expect(res.status).toBe(405);
  });
});
