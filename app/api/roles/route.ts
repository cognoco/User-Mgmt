import { type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  createSuccessResponse,
  createCreatedResponse,
} from '@/lib/api/common';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { mapPermissionServiceError } from '@/lib/api/permission/errorHandler';
import { PermissionValues } from '@/core/permission/models';

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

type CreateRole = z.infer<typeof createSchema>;

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

async function handleGet(
  _req: NextRequest,
  _auth: any,
  data: z.infer<typeof querySchema>,
  services: any,
) {
  const roles = await services.permission.getAllRoles();
  const page = data.page ?? 1;
  const limit = data.limit ?? 20;
  const start = (page - 1) * limit;
  const paginated = roles.slice(start, start + limit);
  return createSuccessResponse({
    roles: paginated,
    page,
    limit,
    total: roles.length,
  });
}

async function handlePost(
  _req: NextRequest,
  auth: any,
  data: CreateRole,
  services: any,
) {
  try {
    const role = await services.permission.createRole({
      ...data,
      permissions: data.permissions ?? []
    }, auth.userId);
    return createCreatedResponse({ role });
  } catch (e) {
    throw mapPermissionServiceError(e as Error);
  }
}

export const GET = createApiHandler(querySchema, handleGet, {
  requireAuth: true,
  requiredPermissions: [PermissionValues.MANAGE_ROLES],
});

export const POST = createApiHandler(createSchema, handlePost, {
  requireAuth: true,
  requiredPermissions: [PermissionValues.MANAGE_ROLES],
});
