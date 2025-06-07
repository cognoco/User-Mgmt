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
  permissions: z.array(z.string()).default([]),
});

type CreateRole = z.infer<typeof createSchema>;

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

async function handleGet(
  _req: NextRequest,
  _auth: any,
  data: z.infer<typeof querySchema>,
  services: any,
) {
  const roles = await services.permission.getAllRoles();
  const start = (data.page - 1) * data.limit;
  const paginated = roles.slice(start, start + data.limit);
  return createSuccessResponse({
    roles: paginated,
    page: data.page,
    limit: data.limit,
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
    const role = await services.permission.createRole(data, auth.userId);
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
