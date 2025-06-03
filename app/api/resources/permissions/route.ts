// POST /api/resources/permissions - Assign permission to user for specific resource
// DELETE /api/resources/permissions - Remove permission from user for specific resource

import { type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  createCreatedResponse,
  createNoContentResponse,
} from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import {
  PermissionValues,
  PermissionSchema,
} from '@/core/permission/models';
import { getApiPermissionService } from '@/services/permission/factory';
import { mapPermissionServiceError } from '@/lib/api/permission/error-handler';

const assignSchema = z.object({
  userId: z.string(),
  permission: PermissionSchema,
  resourceType: z.string(),
  resourceId: z.string(),
});
type AssignPayload = z.infer<typeof assignSchema>;

const removeSchema = assignSchema;

async function handlePost(_req: NextRequest, userId: string | undefined, data: AssignPayload) {
  const service = getApiPermissionService();
  try {
    const permission = await service.assignResourcePermission(
      data.userId,
      data.permission,
      data.resourceType,
      data.resourceId,
      userId,
    );
    return createCreatedResponse({ permission });
  } catch (e) {
    throw mapPermissionServiceError(e as Error);
  }
}

async function handleDelete(userId: string | undefined, data: AssignPayload) {
  const service = getApiPermissionService();
  const ok = await service.removeResourcePermission(
    data.userId,
    data.permission,
    data.resourceType,
    data.resourceId,
    userId,
  );
  console.log(
    `[resource-permissions] removed ${data.permission} for ${data.userId} on ${data.resourceType}:${data.resourceId}`,
  );
  if (!ok) {
    throw mapPermissionServiceError(new Error('delete failed'));
  }
  return createNoContentResponse();
}

export const POST = createProtectedHandler(
  (req, ctx) =>
    withSecurity(async (r) => {
      const body = await r.json();
      return withErrorHandling(
        (r2) =>
          withValidation(assignSchema, (_r, data) => handlePost(_r, ctx?.userId, data), r2, body),
        r,
      );
    })(req),
  PermissionValues.MANAGE_ROLES,
);

export const DELETE = createProtectedHandler(
  (req, ctx) =>
    withSecurity(async (r) => {
      const url = new URL(r.url);
      const params = Object.fromEntries(url.searchParams.entries());
      return withErrorHandling(
        (r2) =>
          withValidation(removeSchema, (_req2, data) => handleDelete(ctx?.userId, data), r2, params),
        r,
      );
    })(req),
  PermissionValues.MANAGE_ROLES,
);
