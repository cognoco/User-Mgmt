import { type NextRequest } from 'next/server';
import { withSecurity } from '@/middleware/with-security';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware
} from '@/middleware/createMiddlewareChain';
import { createSuccessResponse } from '@/lib/api/common';
import { getApiPermissionService } from '@/services/permission/factory';
import type { RouteAuthContext } from '@/middleware/auth';

async function handleMyPermissions(
  _req: NextRequest,
  auth: RouteAuthContext
) {
  if (!auth.userId) {
    return createSuccessResponse({ roles: [], permissions: [], resourcePermissions: [] });
  }

  const service = getApiPermissionService();
  const assignments = await service.getUserRoles(auth.userId);
  const roleEntities = await Promise.all(assignments.map(r => service.getRoleById(r.roleId)));
  const roles = roleEntities.filter(Boolean).map(r => r!.name);
  const permissions = new Set<string>();
  roleEntities.forEach(r => r?.permissions.forEach(p => permissions.add(p)));
  return createSuccessResponse({
    roles,
    permissions: Array.from(permissions),
    resourcePermissions: []
  });
}

const middleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware()
]);

export const GET = withSecurity((req: NextRequest) =>
  middleware((r, auth) => handleMyPermissions(r, auth))(req)
);
