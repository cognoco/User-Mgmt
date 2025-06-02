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

const batchSchema = z.object({
  checks: z.array(querySchema).min(1),
});

type QueryParams = z.infer<typeof querySchema>;

async function handlePermissionCheck(
  _req: NextRequest,
  user: User,
  data: QueryParams,
) {
  const { permission, resource, resourceId } = data;

  if (!isPermission(permission)) {
    throw createPermissionNotFoundError(permission);
  }

  try {
    const service = getApiPermissionService();
    let allowed = false;
    if (resource && resourceId) {
      allowed = await service.hasResourcePermission(
        user.id,
        permission as Permission,
        resource,
        resourceId,
      );
    } else {
      const metadataPerms: string[] =
        (user.app_metadata as any)?.permissions ?? [];
      allowed = metadataPerms.includes(permission);
      if (!allowed) {
        allowed = await service.hasPermission(user.id, permission as Permission);
      }
    }
    return createSuccessResponse({ allowed });
  } catch (error) {
    throw mapPermissionServiceError(error as Error);
  }
}

async function handleBatchCheck(
  req: NextRequest,
  user: User,
  data: z.infer<typeof batchSchema>,
) {
  const results = await Promise.all(
    data.checks.map((c) => handlePermissionCheck(req, user, c).then((r) => r.data.allowed)),
  );
  const formatted = data.checks.map((c, idx) => ({ ...c, allowed: results[idx] }));
  return createSuccessResponse({ results: formatted });
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

export async function POST(request: NextRequest) {
  return withErrorHandling(
    (req) =>
      withRouteAuth(
        async (r, ctx) => {
          const body = await r.json();
          return withValidation(
            batchSchema,
            (r2, data) => handleBatchCheck(r2, ctx.user!, data),
            r,
            body,
          );
        },
        req,
        { includeUser: true },
      ),
    request,
  );
}
