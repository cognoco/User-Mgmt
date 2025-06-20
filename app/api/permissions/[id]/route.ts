import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import { createSuccessResponse } from '@/lib/api/common';
import { PermissionValues, Permission } from '@/core/permission/models';
import { permissionCategoryMap } from '@/lib/rbac/permissionCategories';
import { isPermission } from '@/lib/rbac/roles';

function getPermissionId(req: NextRequest): string {
  const parts = req.nextUrl.pathname.split('/');
  return parts[3] || '';
}

const handleGet = async (req: NextRequest) => {
  const id = getPermissionId(req);
  if (!isPermission(id)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  const category = permissionCategoryMap[id as Permission];
  return createSuccessResponse({ id, category });
};

export const GET = createApiHandler(emptySchema, handleGet, {
  requireAuth: true,
  requiredPermissions: [PermissionValues.MANAGE_ROLES],
  includePermissions: true,
  rateLimit: { windowMs: 15 * 60 * 1000, max: 50 },
});

const methodNotAllowed = createApiHandler(emptySchema, async () => {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}, {
  requireAuth: true,
  requiredPermissions: [PermissionValues.MANAGE_ROLES],
  includePermissions: true,
});

export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;
