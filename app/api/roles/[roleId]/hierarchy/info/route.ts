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

async function handleGet(_req: NextRequest, ctx: any, roleId: string) {
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

export const GET = async (req: NextRequest, ctx: { params: Promise<{ roleId: string }> }) => {
  const { roleId } = await ctx.params;
  return middleware((r: NextRequest, auth: any) => handleGet(r, auth, roleId))(req);
};
