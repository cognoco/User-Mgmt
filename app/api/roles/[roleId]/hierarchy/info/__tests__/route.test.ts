import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/roles/[roleId]/hierarchy/info/route'64;

const mockService = {
  getAncestorRoles: vi.fn(),
  getDescendantRoles: vi.fn(),
  getInheritedPermissions: vi.fn(),
  getEffectivePermissions: vi.fn(),
};
vi.mock('@/lib/services/roleHierarchy.service', () => ({
  createRoleHierarchyService: () => mockService,
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('role hierarchy info API', () => {
  it('GET returns hierarchy details', async () => {
    mockService.getAncestorRoles.mockResolvedValue([]);
    mockService.getDescendantRoles.mockResolvedValue([]);
    mockService.getInheritedPermissions.mockResolvedValue(['p1']);
    mockService.getEffectivePermissions.mockResolvedValue(['p1']);
    const res = await GET({} as any, { params: { roleId: '1' } } as any);
    expect(res.status).toBe(200);
    expect(mockService.getAncestorRoles).toHaveBeenCalledWith('1');
  });
});
