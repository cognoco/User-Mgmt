// POST /api/resources/permissions - Assign permission to user for specific resource
// DELETE /api/resources/permissions - Remove permission from user for specific resource

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  createCreatedResponse,
  createNoContentResponse,
} from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { withRouteAuth } from '@/middleware/auth';
import { withSecurity } from '@/middleware/with-security';
import {
  PermissionValues,
  PermissionSchema,
} from '@/core/permission/models';
import { getApiPermissionService } from '@/services/permission/factory';
import { checkPermission } from '@/lib/auth/permissionCheck';
import { mapPermissionServiceError } from '@/lib/api/permission/error-handler';

const assignSchema = z.object({
  userId: z.string(),
  permission: PermissionSchema,
  resourceType: z.string(),
  resourceId: z.string(),
});
type AssignPayload = z.infer<typeof assignSchema>;

const removeSchema = assignSchema;

async function handlePost(
  _req: NextRequest,
  userId: string,
  data: AssignPayload,
) {
  const allowed =
    (await checkPermission(
      userId,
      PermissionValues.MANAGE_ROLES,
      data.resourceType,
      data.resourceId,
    )) || (await checkPermission(userId, PermissionValues.MANAGE_ROLES));
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
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

async function handleDelete(userId: string, data: AssignPayload) {
  const allowed =
    (await checkPermission(
      userId,
      PermissionValues.MANAGE_ROLES,
      data.resourceType,
      data.resourceId,
    )) || (await checkPermission(userId, PermissionValues.MANAGE_ROLES));
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
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

export const POST = (req: NextRequest) =>
  withRouteAuth((r, auth) =>
    withSecurity(async (r2) => {
      const body = await r2.json();
      return withErrorHandling(
        (r3) => withValidation(assignSchema, (_r, data) => handlePost(_r, auth.userId!, data), r3, body),
        r2,
      );
    })(r),
  req);

export const DELETE = (req: NextRequest) =>
  withRouteAuth((r, auth) =>
    withSecurity(async (r2) => {
      const url = new URL(r2.url);
      const params = Object.fromEntries(url.searchParams.entries());
      return withErrorHandling(
        (r3) => withValidation(removeSchema, (_r, data) => handleDelete(auth.userId!, data), r3, params),
        r2,
      );
    })(r),
  req);
