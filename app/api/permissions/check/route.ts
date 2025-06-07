import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { createApiHandler } from '@/lib/api/routeHelpers'77;
import { createSuccessResponse } from '@/lib/api/common';
import {
  createPermissionNotFoundError,
  mapPermissionServiceError,
} from '@/lib/api/permission/errorHandler'197;
import { isPermission, Permission } from '@/lib/rbac/roles';

const querySchema = z.object({
  permission: z.string().min(1),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
});

const batchSchema = z.object({
  checks: z.array(querySchema).min(1),
});

type QueryParams = z.infer<typeof querySchema>;

async function handlePermissionCheck(
  _req: NextRequest,
  authContext: any,
  services: any,
  data: QueryParams,
) {
  const { permission, resource, resourceId } = data;

  if (!isPermission(permission)) {
    throw createPermissionNotFoundError(permission);
  }

  try {
    let allowed = false;
    if (resource && resourceId) {
      allowed = await services.permission.hasResourcePermission(
        authContext.userId,
        permission as Permission,
        resource,
        resourceId,
      );
    } else {
      const metadataPerms: string[] =
        (authContext.user?.app_metadata as any)?.permissions ?? [];
      allowed = metadataPerms.includes(permission);
      if (!allowed) {
        allowed = await services.permission.hasPermission(authContext.userId, permission as Permission);
      }
    }
    return { allowed };
  } catch (error) {
    throw mapPermissionServiceError(error as Error);
  }
}

export const GET = createApiHandler(
  querySchema,
  async (req: NextRequest, authContext: any, data: QueryParams, services: any) => {
    const result = await handlePermissionCheck(req, authContext, services, data);
    return createSuccessResponse(result);
  },
  {
    requireAuth: true,
    includeUser: true,
  }
);

export const POST = createApiHandler(
  batchSchema,
  async (req: NextRequest, authContext: any, data: z.infer<typeof batchSchema>, services: any) => {
    const results = await Promise.all(
      data.checks.map(async (c) => {
        const response = await handlePermissionCheck(req, authContext, services, c);
        return response.allowed;
      }),
    );
    const formatted = data.checks.map((c, idx) => ({ ...c, allowed: results[idx] }));
    return createSuccessResponse({ results: formatted });
  },
  {
    requireAuth: true,
    includeUser: true,
  }
);
