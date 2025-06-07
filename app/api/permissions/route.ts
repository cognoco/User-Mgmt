// GET /api/permissions - List all permissions
// POST /api/permissions - Not supported (permissions are static)

import { type NextRequest, NextResponse } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers'180;
import { createSuccessResponse } from '@/lib/api/common';
import { PermissionValues } from '@/core/permission/models';

async function handleGet(_req: NextRequest, _auth: any, _data: any, services: any) {
  const permissions = await services.permission.getAllPermissions();
  return createSuccessResponse({ permissions });
}

export const GET = createApiHandler(emptySchema, handleGet, {
  requireAuth: true,
  requiredPermissions: [PermissionValues.MANAGE_ROLES],
  rateLimit: { windowMs: 15 * 60 * 1000, max: 50 },
});

export const POST = createApiHandler(emptySchema, async () => {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}, {
  requireAuth: true,
  requiredPermissions: [PermissionValues.MANAGE_ROLES],
});
