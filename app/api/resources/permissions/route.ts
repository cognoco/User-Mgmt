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

async function handlePost(_req: NextRequest, data: AssignPayload) {
  const service = getApiPermissionService();
  try {
    const permission = await service.assignResourcePermission(
      data.userId,
      data.permission,
      data.resourceType,
      data.resourceId,
    );
    return createCreatedResponse({ permission });
  } catch (e) {
    throw mapPermissionServiceError(e as Error);
  }
}

async function handleDelete(data: AssignPayload) {
  const service = getApiPermissionService();
  const ok = await service.removeResourcePermission(
    data.userId,
    data.permission,
    data.resourceType,
    data.resourceId,
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
  (req) =>
    withSecurity(async (r) => {
      const body = await r.json();
      return withErrorHandling(
        (r2) =>
          withValidation(assignSchema, (_r, data) => handlePost(_r, data), r2, body),
        r,
      );
    })(req),
  PermissionValues.MANAGE_ROLES,
);

export const DELETE = createProtectedHandler(
  (req) =>
    withSecurity(async (r) => {
      const url = new URL(r.url);
      const params = Object.fromEntries(url.searchParams.entries());
      return withErrorHandling(
        (r2) =>
          withValidation(removeSchema, (_req2, data) => handleDelete(data), r2, params),
        r,
      );
    })(req),
  PermissionValues.MANAGE_ROLES,
);
