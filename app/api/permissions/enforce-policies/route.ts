import { NextRequest, NextResponse } from 'next/server';
import { getApiPermissionService } from '@/services/permission/factory';
import { PermissionPolicyService, PolicyViolation } from '@/lib/services/permission-policy.service';
import { PermissionValues } from '@/core/permission/models';

export async function POST(_req: NextRequest) {
  const service = getApiPermissionService();
  const policy = new PermissionPolicyService();
  const roles = await service.getAllRoles();
  const violations: PolicyViolation[] = [];

  for (const role of roles) {
    if (role.name !== 'SUPER_ADMIN' && role.permissions.includes(PermissionValues.ADMIN_ACCESS)) {
      violations.push({
        userId: '',
        permission: PermissionValues.ADMIN_ACCESS,
        reason: `Role ${role.name} has ADMIN_ACCESS`,
      });
    }
  }

  if (violations.length > 0) {
    await policy.reportViolations(violations);
  }

  return NextResponse.json({ success: true, violations });
}
