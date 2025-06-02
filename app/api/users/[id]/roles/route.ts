import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createCreatedResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import { getApiPermissionService } from '@/services/permission/factory';
import { mapPermissionServiceError } from '@/lib/api/permission/error-handler';
import { PermissionValues } from '@/core/permission/models';

// GET /api/users/[id]/roles - Get roles for a user
// POST /api/users/[id]/roles - Assign roles to a user

const assignSchema = z.object({
  roleId: z.string(),
  expiresAt: z.string().optional(),
});

type AssignRole = z.infer<typeof assignSchema>;

async function handleGet(userId: string) {
  const service = getApiPermissionService();
  const roles = await service.getUserRoles(userId);
  return createSuccessResponse({ roles });
}

async function handlePost(
  _req: NextRequest,
  authUserId: string,
  userId: string,
  data: AssignRole,
) {
  const service = getApiPermissionService();
  try {
    const role = await service.assignRoleToUser(
      userId,
      data.roleId,
      authUserId,
      data.expiresAt ? new Date(data.expiresAt) : undefined,
    );
    return createCreatedResponse({ role });
  } catch (e) {
    throw mapPermissionServiceError(e as Error);
  }
}

export const GET = createProtectedHandler(
  (req, ctx) => withErrorHandling(() => handleGet(ctx.params.id), req),
  PermissionValues.MANAGE_ROLES,
);

export const POST = createProtectedHandler(
  (req, ctx) =>
    withSecurity(async (r) => {
      const body = await r.json();
      return withErrorHandling(
        (r3) =>
          withValidation(assignSchema, (r2, data) => handlePost(r2, ctx.userId!, ctx.params.id, data), r3, body),
        r,
      );
    })(req),
  PermissionValues.MANAGE_ROLES,
);
