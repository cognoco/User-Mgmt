import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createNoContentResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import { getApiPermissionService } from '@/services/permission/factory';
import { mapPermissionServiceError, createRoleNotFoundError } from '@/lib/api/permission/error-handler';
import { PermissionValues } from '@/core/permission/models';

const updateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

type UpdateRole = z.infer<typeof updateSchema>;

async function handleGet(id: string) {
  const service = getApiPermissionService();
  const role = await service.getRoleById(id);
  if (!role) {
    throw createRoleNotFoundError(id);
  }
  return createSuccessResponse({ role });
}

async function handlePatch(
  _req: NextRequest,
  userId: string | undefined,
  id: string,
  data: UpdateRole,
) {
  const service = getApiPermissionService();
  try {
    const role = await service.updateRole(id, data, userId);
    return createSuccessResponse({ role });
  } catch (e) {
    throw mapPermissionServiceError(e as Error);
  }
}

async function handlePut(
  _req: NextRequest,
  userId: string | undefined,
  id: string,
  data: UpdateRole,
) {
  const service = getApiPermissionService();
  try {
    const role = await service.updateRole(id, data, userId);
    return createSuccessResponse({ role });
  } catch (e) {
    throw mapPermissionServiceError(e as Error);
  }
}

async function handleDelete(id: string, userId: string | undefined) {
  const service = getApiPermissionService();
  const ok = await service.deleteRole(id, userId);
  if (!ok) {
    throw createRoleNotFoundError(id);
  }
  return createNoContentResponse();
}

export const GET = createProtectedHandler(
  (req, ctx) => withErrorHandling(() => handleGet(ctx.params.roleId), req),
  PermissionValues.MANAGE_ROLES
);

export const PATCH = createProtectedHandler(
  (req, ctx) =>
    withSecurity(async (r) => {
      const body = await r.json();
      return withErrorHandling(
        (r3) => withValidation(updateSchema, (r2, data) => handlePatch(r2, ctx?.userId, ctx.params.roleId, data), r3, body),
        r
      );
    })(req),
  PermissionValues.MANAGE_ROLES
);

export const PUT = createProtectedHandler(
  (req, ctx) =>
    withSecurity(async (r) => {
      const body = await r.json();
      return withErrorHandling(
        (r3) => withValidation(updateSchema, (r2, data) => handlePut(r2, ctx?.userId, ctx.params.roleId, data), r3, body),
        r,
      );
    })(req),
  PermissionValues.MANAGE_ROLES,
);

export const DELETE = createProtectedHandler(
  (req, ctx) =>
    withSecurity((r) => withErrorHandling(() => handleDelete(ctx.params.roleId, ctx?.userId), r))(req),
  PermissionValues.MANAGE_ROLES
);
