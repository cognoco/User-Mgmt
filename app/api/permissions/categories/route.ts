import { NextRequest } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers'44;
import { createSuccessResponse } from '@/lib/api/common';
import { PermissionValues } from '@/core/permission/models';
import { listPermissionCategories } from '@/lib/rbac/permissionCategories'239;

async function handleGet(_req: NextRequest) {
  const categories = listPermissionCategories();
  return createSuccessResponse({ categories });
}

export const GET = createApiHandler(emptySchema, handleGet, {
  requireAuth: true,
  requiredPermissions: [PermissionValues.MANAGE_ROLES],
  rateLimit: { windowMs: 15 * 60 * 1000, max: 50 },
});
