import { type NextRequest } from 'next/server';
import { z } from 'zod';

import {
  createSuccessResponse,
  withErrorHandling,
  withValidation,
  withAuth,
} from '@/lib/api/common';
import {
  createPermissionNotFoundError,
  mapPermissionServiceError,
} from '@/lib/api/permission/error-handler';
import { getApiPermissionService } from '@/services/permission/factory';
import { isPermission, Permission } from '@/lib/rbac/roles';

const querySchema = z.object({
  permission: z.string().min(1),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
});

type QueryParams = z.infer<typeof querySchema>;

async function handlePermissionCheck(
  _req: NextRequest,
  userId: string,
  data: QueryParams
) {
  const permissionService = getApiPermissionService();
  const { permission } = data;

  if (!isPermission(permission)) {
    throw createPermissionNotFoundError(permission);
  }

  try {
    const hasPermission = await permissionService.hasPermission(
      userId,
      permission as Permission
    );
    return createSuccessResponse({ hasPermission });
  } catch (error) {
    throw mapPermissionServiceError(error as Error);
  }
}

export async function GET(request: NextRequest) {
  return withErrorHandling(
    (req) =>
      withAuth((r, userId) => {
        const url = new URL(r.url);
        const params = Object.fromEntries(url.searchParams.entries());
        return withValidation(querySchema, (r2, data) => handlePermissionCheck(r2, userId, data), r, params);
      }, req),
    request
  );
}
