import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createNoContentResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { getApiAdminService } from '@/services/admin/factory';
import { createUserNotFoundError } from '@/lib/api/admin/error-handler';
import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import { notifyUserChanges } from '@/lib/realtime/notifyUserChanges';

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

type UpdateUser = z.infer<typeof updateUserSchema>;

async function handleGetUser(req: NextRequest, { params }: { params: { id: string } }) {
  const adminService = getApiAdminService();
  const user = await adminService.getUserById(params.id);
  if (!user) {
    throw createUserNotFoundError(params.id);
  }
  return createSuccessResponse({ user });
}

async function handleUpdateUser(req: NextRequest, data: UpdateUser, { params }: { params: { id: string } }) {
  const adminService = getApiAdminService();
  const existingUser = await adminService.getUserById(params.id);
  if (!existingUser) {
    throw createUserNotFoundError(params.id);
  }
  const updated = await adminService.updateUser(params.id, data);
  await notifyUserChanges('UPDATE', params.id, updated, existingUser);
  return createSuccessResponse({ user: updated });
}

async function handleDeleteUser(req: NextRequest, { params }: { params: { id: string } }) {
  const adminService = getApiAdminService();
  const existingUser = await adminService.getUserById(params.id);
  if (!existingUser) {
    throw createUserNotFoundError(params.id);
  }
  await adminService.deleteUser(params.id);
  await notifyUserChanges('DELETE', params.id, null, existingUser);
  return createNoContentResponse();
}

export const GET = createProtectedHandler(
  (req, ctx) => withErrorHandling(() => handleGetUser(req, ctx), req),
  'admin.users.view'
);

export const PUT = createProtectedHandler(
  (req, ctx) =>
    withSecurity(async (r) => {
      const data = await r.json();
      return withErrorHandling(
        () =>
          withValidation(updateUserSchema, (r2, validated) => handleUpdateUser(r2, validated, ctx), r, data),
        r
      );
    })(req),
  'admin.users.update'
);

export const DELETE = createProtectedHandler(
  (req, ctx) =>
    withSecurity((r) => withErrorHandling(() => handleDeleteUser(r, ctx), r))(req),
  'admin.users.delete'
);
