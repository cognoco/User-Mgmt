// GET /api/permissions - List all permissions with optional filtering
// POST /api/permissions - Create a new permission (admin only)

import { type NextRequest } from 'next/server';
import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import { PermissionValues } from '@/core/permission/models';
import { getApiPermissionService } from '@/services/permission/factory';

async function handleGet() {
  const permissionService = getApiPermissionService();
  const permissions = await permissionService.getAllPermissions();
  return createSuccessResponse({ permissions });
}

export const GET = createProtectedHandler(
  (req) => withErrorHandling(() => handleGet(), req),
  PermissionValues.MANAGE_ROLES,
);

export const POST = createProtectedHandler(
  (req) =>
    withSecurity(async () => new Response('Not implemented', { status: 501 }))(req),
  PermissionValues.MANAGE_ROLES,
);
