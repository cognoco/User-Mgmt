import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers'58;
import { PermissionPolicyService, PolicyViolation } from '@/lib/services/permissionPolicy.service'132;
import { PermissionValues } from '@/core/permission/models';

export const POST = createApiHandler(
  emptySchema,
  async (_req: NextRequest, authContext: any, _data: any, services: any) => {
    const policy = new PermissionPolicyService();
    const roles = await services.permission.getAllRoles();
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
  },
  {
    requireAuth: true,
    requiredPermissions: [PermissionValues.ADMIN_ACCESS],
  }
);
