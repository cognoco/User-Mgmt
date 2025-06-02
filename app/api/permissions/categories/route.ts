// GET /api/permissions/categories - List all permission categories

import { createProtectedHandler } from '@/middleware/permissions';
import { PermissionValues } from '@/core/permission/models';

export const GET = createProtectedHandler(
  async () => new Response('Not implemented', { status: 501 }),
  PermissionValues.MANAGE_ROLES,
);
