import { NextRequest } from 'next/server';
import { createRoleHierarchyService } from '@/lib/services/roleHierarchy.service';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
} from '@/middleware/createMiddlewareChain';
import { createSuccessResponse } from '@/lib/api/common';

const middleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
]);

async function handleGet(_req: NextRequest, ctx: any) {
  const roleId = ctx.params.roleId;
  const service = createRoleHierarchyService();

  const [ancestors, descendants, inheritedPermissions, effectivePermissions] = await Promise.all([
    service.getAncestorRoles(roleId),
    service.getDescendantRoles(roleId),
    service.getInheritedPermissions(roleId),
    service.getEffectivePermissions(roleId),
  ]);

  return createSuccessResponse({
    roleId,
    ancestors,
    descendants,
    inheritedPermissions,
    effectivePermissions,
  });
}

export const GET = middleware((req: NextRequest, auth: any) => handleGet(req, auth));
