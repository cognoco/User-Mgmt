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

const CheckRoleSchema = z.object({
  role: z.string().min(1),
  includeHierarchy: z.boolean().optional()
});

async function handleCheckRole(
  _req: NextRequest,
  auth: RouteAuthContext,
  data: z.infer<typeof CheckRoleSchema>
) {
  if (!auth.userId) {
    return createSuccessResponse({ hasRole: false });
  }
  const service = getApiPermissionService();
  const hasRole = await service.hasRole(auth.userId, data.role as any);
  return createSuccessResponse({ hasRole, effectiveRole: hasRole ? data.role : undefined });
}

const middleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(CheckRoleSchema)
]);

export const POST = withSecurity((req: NextRequest) =>
  middleware((r, auth, data) => handleCheckRole(r, auth, data))(req)
);
