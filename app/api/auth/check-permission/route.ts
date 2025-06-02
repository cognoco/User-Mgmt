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
import type { RouteAuthContext } from '@/middleware/auth';

const CheckPermissionSchema = z.object({
  permission: z.string().min(1)
});

async function handleCheckPermission(
  _req: NextRequest,
  auth: RouteAuthContext,
  data: z.infer<typeof CheckPermissionSchema>
) {
  if (!auth.userId) {
    return createSuccessResponse({ hasPermission: false });
  }
  const service = getApiPermissionService();
  const allowed = await service.hasPermission(auth.userId, data.permission as any);
  return createSuccessResponse({ hasPermission: allowed });
}

const middleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(CheckPermissionSchema)
]);

export const POST = withSecurity((req: NextRequest) =>
  middleware((r, auth, data) => handleCheckPermission(r, auth, data))(req)
);
