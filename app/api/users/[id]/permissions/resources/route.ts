import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createProtectedHandler } from '@/middleware/permissions';
import { PermissionValues } from '@/core/permission/models';
import { getApiPermissionService } from '@/services/permission/factory';

// GET /api/users/[id]/permissions/resources - Get resource permissions for a user

const querySchema = z.object({
  resourceType: z.string().optional(),
  sortBy: z.enum(['created', 'type']).optional().default('created'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});
type Query = z.infer<typeof querySchema>;

async function handleGet(userId: string, query: Query) {
  const service = getApiPermissionService();
  let permissions = await service.getUserResourcePermissions(userId);
  if (query.resourceType) {
    permissions = permissions.filter((p) => p.resourceType === query.resourceType);
  }
  if (query.sortBy === 'type') {
    permissions.sort((a, b) => a.resourceType.localeCompare(b.resourceType));
  } else {
    permissions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  if (query.order === 'desc') {
    permissions.reverse();
  }
  return createSuccessResponse({ permissions });
}

export const GET = createProtectedHandler(
  (req, ctx) =>
    withErrorHandling(() => {
      const url = new URL(req.url);
      const params = Object.fromEntries(url.searchParams.entries());
      return withValidation(querySchema, (_r, data) => handleGet(ctx.params.id, data), req, params);
    }, req),
  PermissionValues.MANAGE_ROLES,
);
