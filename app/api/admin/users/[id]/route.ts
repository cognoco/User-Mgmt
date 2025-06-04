import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import { createSuccessResponse, createNoContentResponse } from '@/lib/api/common';
import { PermissionValues } from '@/core/permission/models';
import { createUserNotFoundError } from '@/lib/api/admin/error-handler';
import { notifyUserChanges } from '@/lib/realtime/notifyUserChanges';

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

function extractUserIdFromPath(pathname: string): string {
  const pathParts = pathname.split('/');
  const userId = pathParts[pathParts.length - 1];
  if (!userId || userId === '') {
    throw new Error('User ID is required');
  }
  return userId;
}

export const GET = createApiHandler(
  emptySchema,
  async (req: NextRequest, authContext: any, data: any, services: any) => {
    const userId = extractUserIdFromPath(req.url);
    
    const user = await services.admin.getUserById(userId);
    if (!user) {
      throw createUserNotFoundError(userId);
    }
    return createSuccessResponse({ user });
  },
  {
    requireAuth: true,
    requiredPermissions: [PermissionValues.ADMIN_ACCESS],
  }
);

export const PUT = createApiHandler(
  updateUserSchema,
  async (req: NextRequest, authContext: any, data: z.infer<typeof updateUserSchema>, services: any) => {
    const userId = extractUserIdFromPath(req.url);
    
    const existingUser = await services.admin.getUserById(userId);
    if (!existingUser) {
      throw createUserNotFoundError(userId);
    }
    const updated = await services.admin.updateUser(userId, data);
    await notifyUserChanges('UPDATE', userId, updated, existingUser);
    return createSuccessResponse({ user: updated });
  },
  {
    requireAuth: true,
    requiredPermissions: [PermissionValues.ADMIN_ACCESS],
  }
);

export const DELETE = createApiHandler(
  emptySchema,
  async (req: NextRequest, authContext: any, data: any, services: any) => {
    const userId = extractUserIdFromPath(req.url);
    
    const existingUser = await services.admin.getUserById(userId);
    if (!existingUser) {
      throw createUserNotFoundError(userId);
    }
    await services.admin.deleteUser(userId);
    await notifyUserChanges('DELETE', userId, null, existingUser);
    return createNoContentResponse();
  },
  {
    requireAuth: true,
    requiredPermissions: [PermissionValues.ADMIN_ACCESS],
  }
);
