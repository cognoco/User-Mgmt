import { describe, it, expect, vi } from 'vitest';
import { PermissionPolicyService } from '@/lib/services/permissionPolicy.service';
import { PermissionValues, RoleValues } from '@/core/permission/models';
import { logUserAction } from '@/lib/audit/auditLogger';

vi.mock('@/lib/audit/auditLogger', () => ({ logUserAction: vi.fn() }));

describe('PermissionPolicyService', () => {
  it('detects invalid role permission assignment', async () => {
    const service = new PermissionPolicyService();
    const v = await service.checkRolePermissionAssignment(RoleValues.ADMIN, PermissionValues.ADMIN_ACCESS);
    expect(v).not.toBeNull();
  });

  it('reports violations', async () => {
    const service = new PermissionPolicyService();
    await service.reportViolations([
      { userId: 'u1', permission: PermissionValues.ADMIN_ACCESS, reason: 'test' },
    ]);
    expect(logUserAction).toHaveBeenCalled();
  });

  it('validates bulk operations', async () => {
    const service = new PermissionPolicyService();
    const v = await service.validateBulkOperations([
      { userId: 'u1', permission: PermissionValues.ADMIN_ACCESS, roleName: RoleValues.ADMIN },
    ]);
    expect(v.length).toBe(1);
  });
});
