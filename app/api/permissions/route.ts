// GET /api/permissions - List all permissions with optional filtering
// POST /api/permissions - Create a new permission (admin only)

import { type NextRequest, NextResponse } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import { createSuccessResponse } from '@/lib/api/common';
import { PermissionValues } from '@/core/permission/models';

async function handleGet(_req: NextRequest, _authContext: any, _data: any, services: any) {
  const permissions = await services.permission.getAllPermissions();
  return createSuccessResponse({ permissions });
}

export const GET = createApiHandler(emptySchema, handleGet, {
  requireAuth: true,
  requiredPermissions: [PermissionValues.MANAGE_ROLES],
});

export const POST = createApiHandler(
  emptySchema,
  async (_req: NextRequest, _authContext: any, _data: any, _services: any) => {
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
  },
  {
    requireAuth: true,
    requiredPermissions: [PermissionValues.MANAGE_ROLES],
  }
);
