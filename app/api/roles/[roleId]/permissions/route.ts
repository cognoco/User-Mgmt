import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createNoContentResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import { getApiPermissionService } from '@/services/permission/factory';
import { mapPermissionServiceError } from '@/lib/api/permission/error-handler';
import { PermissionValues } from '@/core/permission/models';

const modifySchema = z.object({
  permission: z.string(),
});

type Modify = z.infer<typeof modifySchema>;

async function handleGet(roleId: string) {
  const service = getApiPermissionService();
  const permissions = await service.getRolePermissions(roleId);
  return createSuccessResponse({ permissions });
}

async function handlePost(_req: NextRequest, roleId: string, data: Modify) {
  const service = getApiPermissionService();
  try {
    const permission = await service.addPermissionToRole(roleId, data.permission);
    return createSuccessResponse({ permission });
  } catch (e) {
    throw mapPermissionServiceError(e as Error);
  }
}

async function handleDelete(_req: NextRequest, roleId: string, data: Modify) {
  const service = getApiPermissionService();
  try {
    await service.removePermissionFromRole(roleId, data.permission);
    return createNoContentResponse();
  } catch (e) {
    throw mapPermissionServiceError(e as Error);
  }
}

export const GET = createProtectedHandler(
  (req, ctx) => withErrorHandling(() => handleGet(ctx.params.roleId), req),
  PermissionValues.MANAGE_ROLES,
);

export const POST = createProtectedHandler(
  (req, ctx) =>
    withSecurity(async (r) => {
      const body = await r.json();
      return withErrorHandling(
        (r3) => withValidation(modifySchema, (r2, data) => handlePost(r2, ctx.params.roleId, data), r3, body),
        r,
      );
    })(req),
  PermissionValues.MANAGE_ROLES,
);

export const DELETE = createProtectedHandler(
  (req, ctx) =>
    withSecurity(async (r) => {
      const body = await r.json();
      return withErrorHandling(
        (r3) => withValidation(modifySchema, (r2, data) => handleDelete(r2, ctx.params.roleId, data), r3, body),
        r,
      );
    })(req),
  PermissionValues.MANAGE_ROLES,
);
