import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import { PermissionValues } from '@/core/permission/models';
import { getApiRoleService } from '@/services/role/factory';

const parentSchema = z.object({
  parentRoleId: z.string().nullable(),
});

type ParentPayload = z.infer<typeof parentSchema>;

async function handleGet(roleId: string) {
  const service = getApiRoleService();
  const ancestors = await service.getAncestorRoles(roleId);
  const descendants = await service.getDescendantRoles(roleId);
  return createSuccessResponse({ ancestors, descendants });
}

async function handlePut(_req: NextRequest, roleId: string, data: ParentPayload) {
  const service = getApiRoleService();
  await service.setParentRole(roleId, data.parentRoleId);
  return createSuccessResponse({});
}

export const GET = createProtectedHandler(
  (req, ctx) => withErrorHandling(() => handleGet(ctx.params.roleId), req),
  PermissionValues.MANAGE_ROLES,
);

export const PUT = createProtectedHandler(
  (req, ctx) =>
    withSecurity(async (r) => {
      const body = await r.json();
      return withErrorHandling(
        (r3) => withValidation(parentSchema, (r2, data) => handlePut(r2, ctx.params.roleId, data), r3, body),
        r,
      );
    })(req),
  PermissionValues.MANAGE_ROLES,
);
