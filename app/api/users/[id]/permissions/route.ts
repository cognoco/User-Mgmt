import { type NextRequest } from 'next/server';
import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { createProtectedHandler } from '@/middleware/permissions';
import { getApiPermissionService } from '@/services/permission/factory';
import { PermissionValues, type Permission } from '@/core/permission/models';

// GET /api/users/[id]/permissions - Get effective permissions for a user

async function handleGet(userId: string) {
  const service = getApiPermissionService();
  const roles = await service.getUserRoles(userId);
  const permissions = new Set<Permission>();
  for (const role of roles) {
    const roleData = await service.getRoleById(role.roleId);
    roleData?.permissions.forEach((p) => permissions.add(p));
  }
  return createSuccessResponse({ permissions: Array.from(permissions) });
}

export const GET = createProtectedHandler(
  (req, ctx) => withErrorHandling(() => handleGet(ctx.params.id), req),
  PermissionValues.MANAGE_ROLES,
);
