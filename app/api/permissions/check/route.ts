import { type NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { z } from 'zod';

import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { withRouteAuth } from '@/middleware/auth';
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
  user: User,
  data: QueryParams
) {
  const { permission } = data;

  if (!isPermission(permission)) {
    throw createPermissionNotFoundError(permission);
  }

  try {
    const metadataPerms: string[] =
      (user.app_metadata as any)?.permissions ?? [];
    let hasPermission = metadataPerms.includes(permission);

    if (!hasPermission) {
      const permissionService = getApiPermissionService();
      hasPermission = await permissionService.hasPermission(
        user.id,
        permission as Permission
      );
    }
    return createSuccessResponse({ hasPermission });
  } catch (error) {
    throw mapPermissionServiceError(error as Error);
  }
}

export async function GET(request: NextRequest) {
  return withErrorHandling(
    (req) =>
      withRouteAuth(
        (r, ctx) => {
          const url = new URL(r.url);
          const params = Object.fromEntries(url.searchParams.entries());
          return withValidation(
            querySchema,
            (r2, data) => handlePermissionCheck(r2, ctx.user!, data),
            r,
            params
          );
        },
        req,
        { includeUser: true }
      ),
    request
  );
}
