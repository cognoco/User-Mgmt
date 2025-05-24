import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createNoContentResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { getApiAdminService } from '@/services/admin/factory';
import { createUserNotFoundError } from '@/lib/api/admin/error-handler';
import { createProtectedHandler } from '@/middleware/permissions';

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
  const updated = await adminService.updateUser(params.id, data);
  return createSuccessResponse({ user: updated });
}

async function handleDeleteUser(req: NextRequest, { params }: { params: { id: string } }) {
  const adminService = getApiAdminService();
  await adminService.deleteUser(params.id);
  return createNoContentResponse();
}

export const GET = createProtectedHandler(
  (req, ctx) => withErrorHandling(() => handleGetUser(req, ctx), req),
  'admin.users.view'
);

export const PUT = createProtectedHandler(
  (req, ctx) =>
    withErrorHandling(async () => {
      const data = await req.json();
      return withValidation(updateUserSchema, (r, validated) => handleUpdateUser(r, validated, ctx), req, data);
    }, req),
  'admin.users.update'
);

export const DELETE = createProtectedHandler(
  (req, ctx) => withErrorHandling(() => handleDeleteUser(req, ctx), req),
  'admin.users.delete'
);
