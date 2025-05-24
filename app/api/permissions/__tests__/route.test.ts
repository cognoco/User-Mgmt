import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';

const mockPermissionService = {
  getAllPermissions: vi.fn(),
};
vi.mock('@/services/permission/factory', () => ({
  getApiPermissionService: () => mockPermissionService,
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/permissions', () => {
  it('returns list of permissions', async () => {
    mockPermissionService.getAllPermissions.mockResolvedValue(['READ']);
    const res = await GET({} as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.permissions).toEqual(['READ']);
  });
});
