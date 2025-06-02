// GET /api/resources/[type]/[id]/permissions - List permissions for a resource
// GET /api/resources/[type]/[id]/users - List users with permissions for a resource

import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createPaginatedResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createProtectedHandler } from '@/middleware/permissions';
import { PermissionValues } from '@/core/permission/models';
import { getApiPermissionService } from '@/services/permission/factory';

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  pageSize: z.coerce.number().int().positive().max(100).default(20).optional(),
  userId: z.string().optional(),
  permission: z.string().optional(),
});
type Query = z.infer<typeof querySchema>;

async function handleGet(
  _req: NextRequest,
  resourceType: string,
  resourceId: string,
  query: Query,
) {
  const service = getApiPermissionService();
  let permissions = await service.getPermissionsForResource(resourceType, resourceId);
  if (query.userId) {
    permissions = permissions.filter((p) => p.userId === query.userId);
  }
  if (query.permission) {
    permissions = permissions.filter((p) => p.permission === query.permission);
  }
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const totalItems = permissions.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const start = (page - 1) * pageSize;
  const paginated = permissions.slice(start, start + pageSize);
  return createPaginatedResponse(paginated, {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  });
}

export const GET = createProtectedHandler(
  (req, ctx) =>
    withErrorHandling(() => {
      const url = new URL(req.url);
      const params = Object.fromEntries(url.searchParams.entries());
      return withValidation(
        querySchema,
        (r, data) => handleGet(r, ctx.params.type, ctx.params.id, data),
        req,
        params,
      );
    }, req),
  PermissionValues.MANAGE_ROLES,
);
