// POST /api/resources/permissions - Assign permission to user for specific resource
// DELETE /api/resources/permissions - Remove permission from user for specific resource

import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import { PermissionValues } from '@/core/permission/models';

export const POST = createProtectedHandler(
  (req) =>
    withSecurity(async () => new Response('Not implemented', { status: 501 }))(req),
  PermissionValues.MANAGE_ROLES,
);

export const DELETE = createProtectedHandler(
  (req) =>
    withSecurity(async () => new Response('Not implemented', { status: 501 }))(req),
  PermissionValues.MANAGE_ROLES,
);
