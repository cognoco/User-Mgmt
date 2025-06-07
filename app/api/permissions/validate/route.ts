import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { createSuccessResponse } from '@/lib/api/common';
import { createResourcePermissionResolver } from '@/lib/services/resourcePermissionResolver.service';

const querySchema = z.object({
  userId: z.string(),
  permission: z.string(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
});

export const GET = createApiHandler(
  querySchema,
  async (_req: NextRequest, authContext: any, data: z.infer<typeof querySchema>, services: any) => {
    const resolver = createResourcePermissionResolver();
    const { userId, permission, resourceType, resourceId } = data;

    let allowed: boolean;
    if (resourceType && resourceId) {
      allowed = await services.permission.hasResourcePermission(
        userId,
        permission as any,
        resourceType,
        resourceId,
      );
    } else {
      allowed = await services.permission.hasPermission(userId, permission as any);
    }

    const userRoles = await services.permission.getUserRoles(userId);
    const contributingRoles: string[] = [];
    for (const r of userRoles) {
      const perms = await services.role.getEffectivePermissions(r.roleId);
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
  },
  {
    requireAuth: true,
  }
);
