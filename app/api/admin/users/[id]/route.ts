import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createNoContentResponse } from '@/lib/api/common';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware,
  type RouteAuthContext,
} from '@/middleware/createMiddlewareChain';
import { getApiAdminService } from '@/services/admin/factory';
import { createUserNotFoundError } from '@/lib/api/admin/error-handler';
import { withSecurity } from '@/middleware/with-security';
import { notifyUserChanges } from '@/lib/realtime/notifyUserChanges';

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

type UpdateUser = z.infer<typeof updateUserSchema>;

async function handleGetUser(
  req: NextRequest,
  _auth: RouteAuthContext,
  { params }: { params: { id: string } }
) {
  const adminService = getApiAdminService();
  const user = await adminService.getUserById(params.id);
  if (!user) {
    throw createUserNotFoundError(params.id);
  }
  return createSuccessResponse({ user });
}

async function handleUpdateUser(
  req: NextRequest,
  _auth: RouteAuthContext,
  data: UpdateUser,
  { params }: { params: { id: string } }
) {
  const adminService = getApiAdminService();
  const existingUser = await adminService.getUserById(params.id);
  if (!existingUser) {
    throw createUserNotFoundError(params.id);
  }
  const updated = await adminService.updateUser(params.id, data);
  await notifyUserChanges('UPDATE', params.id, updated, existingUser);
  return createSuccessResponse({ user: updated });
}

async function handleDeleteUser(
  req: NextRequest,
  _auth: RouteAuthContext,
  { params }: { params: { id: string } }
) {
  const adminService = getApiAdminService();
  const existingUser = await adminService.getUserById(params.id);
  if (!existingUser) {
    throw createUserNotFoundError(params.id);
  }
  await adminService.deleteUser(params.id);
  await notifyUserChanges('DELETE', params.id, null, existingUser);
  return createNoContentResponse();
}

const getMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: ['admin.users.view'] }),
]);

export const GET = (
  req: NextRequest,
  ctx: { params: { id: string } }
) => getMiddleware((r, auth) => handleGetUser(r, auth, ctx))(req);

const putMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: ['admin.users.update'] }),
  validationMiddleware(updateUserSchema),
]);

export const PUT = (
  req: NextRequest,
  ctx: { params: { id: string } }
) =>
  withSecurity((r) =>
    putMiddleware(async (r2, auth, data) => handleUpdateUser(r2, auth, data, ctx))(r)
  )(req);

const deleteMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: ['admin.users.delete'] }),
]);

export const DELETE = (
  req: NextRequest,
  ctx: { params: { id: string } }
) =>
  withSecurity((r) =>
    deleteMiddleware((r2, auth) => handleDeleteUser(r2, auth, ctx))(r)
  )(req);
