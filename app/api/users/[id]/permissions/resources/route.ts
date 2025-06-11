import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse } from '@/lib/api/common';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { PermissionValues } from '@/core/permission/models';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

// GET /api/users/[id]/permissions/resources - Get resource permissions for a user

const querySchema = z.object({
  resourceType: z.string().optional(),
  sortBy: z.enum(['created', 'type']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
type Query = z.infer<typeof querySchema>;

async function handleGet(
  _req: NextRequest,
  _auth: AuthContext,
  query: Query,
  services: ServiceContainer,
  userId: string,
) {
  let permissions = await services.permission!.getUserResourcePermissions(userId);
  if (query.resourceType) {
    permissions = permissions.filter((p) => p.resourceType === query.resourceType);
  }
  const sortBy = query.sortBy ?? 'created';
  const order = query.order ?? 'asc';
  
  if (sortBy === 'type') {
    permissions.sort((a, b) => a.resourceType.localeCompare(b.resourceType));
  } else {
    permissions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  if (order === 'desc') {
    permissions.reverse();
  }
  return createSuccessResponse({ permissions });
}

export const GET = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  const { id } = await ctx.params;
  return createApiHandler(
    querySchema,
    (r, auth, data, services) => handleGet(r, auth, data, services, id),
    { requireAuth: true, requiredPermissions: [PermissionValues.MANAGE_ROLES] },
  )(req);
};
