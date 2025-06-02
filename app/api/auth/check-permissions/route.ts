import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { withSecurity } from '@/middleware/with-security';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware
} from '@/middleware/createMiddlewareChain';
import { createSuccessResponse } from '@/lib/api/common';
import { getApiPermissionService } from '@/services/permission/factory';
import { permissionCheckCache } from '@/lib/auth/permission-cache';
import type { RouteAuthContext } from '@/middleware/auth';

const CheckSchema = z.object({
  permission: z.string().min(1),
  resourceType: z.string().optional(),
  resourceId: z.string().optional()
});

const BatchSchema = z.object({
  checks: z.array(CheckSchema).min(1)
});

async function handleCheckPermissions(
  _req: NextRequest,
  auth: RouteAuthContext,
  data: z.infer<typeof BatchSchema>
) {
  if (!auth.userId) {
    return createSuccessResponse({
      results: data.checks.map(c => ({ permission: c.permission, hasPermission: false }))
    });
  }

  const service = getApiPermissionService();
  const results = await Promise.all(
    data.checks.map(async (c) => {
      const key = `${auth.userId}:${c.permission}:${c.resourceType ?? ''}:${c.resourceId ?? ''}`;
      const allowed = await permissionCheckCache.getOrCreate(key, () =>
        service.hasPermission(auth.userId!, c.permission as any)
      );
      return { permission: c.permission, hasPermission: allowed };
    })
  );

  return createSuccessResponse({ results });
}

const middleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(BatchSchema)
]);

export const POST = withSecurity((req: NextRequest) =>
  middleware((r, auth, data) => handleCheckPermissions(r, auth, data))(req)
);
