import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createMiddlewareChain } from '@/middleware/createMiddlewareChain';
import { errorHandlingMiddleware, routeAuthMiddleware, validationMiddleware } from '@/middleware/createMiddlewareChain';
import { createSuccessResponse } from '@/lib/api/common';
import { getApiPermissionService } from '@/services/permission/factory';
import { getApiRoleService } from '@/services/role/factory';
import { createResourcePermissionResolver } from '@/lib/services/resource-permission-resolver.service';

const querySchema = z.object({
  userId: z.string(),
  permission: z.string(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
});

const middleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(querySchema),
]);

async function handleGet(_req: NextRequest, _auth: any, data: z.infer<typeof querySchema>) {
  const permissionService = getApiPermissionService();
  const roleService = getApiRoleService();
  const resolver = createResourcePermissionResolver();
  const { userId, permission, resourceType, resourceId } = data;

  let allowed: boolean;
  if (resourceType && resourceId) {
    allowed = await permissionService.hasResourcePermission(
      userId,
      permission as any,
      resourceType,
      resourceId,
    );
  } else {
    allowed = await permissionService.hasPermission(userId, permission as any);
  }

  const userRoles = await permissionService.getUserRoles(userId);
  const contributingRoles: string[] = [];
  for (const r of userRoles) {
    const perms = await roleService.getEffectivePermissions(r.roleId);
    if (perms.includes(permission as any)) {
      contributingRoles.push(r.roleId);
    }
  }

  let inheritance: any[] = [];
  if (resourceType && resourceId) {
    inheritance = await resolver.getResourceAncestors(resourceType, resourceId);
  }

  return createSuccessResponse({
    allowed,
    roles: contributingRoles,
    inheritance,
  });
}

export const GET = middleware(handleGet);
