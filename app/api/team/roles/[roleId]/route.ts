import { NextRequest } from 'next/server';
import { createSuccessResponse } from '@/lib/api/common';
import { RoleDefinition, isRole, RoleType } from '@/lib/rbac/roles';
import { createRoleNotFoundError } from '@/lib/api/permission/errorHandler'173;
import { withErrorHandling } from '@/middleware/errorHandling'252;

async function handleGet(roleId: string) {
  if (!isRole(roleId)) {
    throw createRoleNotFoundError(roleId);
  }
  const role = { id: roleId, ...RoleDefinition[roleId as RoleType] };
  return createSuccessResponse({ role });
}

export async function GET(req: NextRequest, ctx: { params: { roleId: string } }) {
  return withErrorHandling(() => handleGet(ctx.params.roleId), req);
}
