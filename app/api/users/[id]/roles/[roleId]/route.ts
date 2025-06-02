import { type NextRequest } from 'next/server';
import { createNoContentResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import { getApiPermissionService } from '@/services/permission/factory';
import { createRoleNotFoundError } from '@/lib/api/permission/error-handler';
import { PermissionValues } from '@/core/permission/models';

// DELETE /api/users/[id]/roles/[roleId] - Remove role from a user

async function handleDelete(userId: string, roleId: string) {
  const service = getApiPermissionService();
  const ok = await service.removeRoleFromUser(userId, roleId);
  if (!ok) {
    throw createRoleNotFoundError(roleId);
  }
  return createNoContentResponse();
}

export const DELETE = createProtectedHandler(
  (req, ctx) =>
    withSecurity((r) => withErrorHandling(() => handleDelete(ctx.params.id, ctx.params.roleId), r))(req),
  PermissionValues.MANAGE_ROLES,
);
