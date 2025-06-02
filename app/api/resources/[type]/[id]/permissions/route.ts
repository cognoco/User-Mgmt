// GET /api/resources/[type]/[id]/permissions - List permissions for a resource
// GET /api/resources/[type]/[id]/users - List users with permissions for a resource

import { createProtectedHandler } from '@/middleware/permissions';
import { PermissionValues } from '@/core/permission/models';

export const GET = createProtectedHandler(
  async () => new Response('Not implemented', { status: 501 }),
  PermissionValues.MANAGE_ROLES,
);
