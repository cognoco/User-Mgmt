// GET /api/permissions/[id] - Get permission details
// PUT /api/permissions/[id] - Update permission
// DELETE /api/permissions/[id] - Delete permission

import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import { PermissionValues } from '@/core/permission/models';

export const GET = createProtectedHandler(
  async () => new Response('Not implemented', { status: 501 }),
  PermissionValues.MANAGE_ROLES,
);

export const PUT = createProtectedHandler(
  (req) =>
    withSecurity(async () => new Response('Not implemented', { status: 501 }))(req),
  PermissionValues.MANAGE_ROLES,
);

export const DELETE = createProtectedHandler(
  (req) =>
    withSecurity(async () => new Response('Not implemented', { status: 501 }))(req),
  PermissionValues.MANAGE_ROLES,
);
