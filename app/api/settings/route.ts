import { z } from 'zod';
import type { UserService } from '@/core/user/interfaces';
import { createSuccessResponse } from '@/lib/api/common';
import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import { userPreferencesSchema } from '@/types/database';
import { mapUserServiceError } from '@/lib/api/user/error-handler';

const UpdateSchema = userPreferencesSchema
  .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
  .partial();

async function handleGet(userId: string, userService: UserService) {
  const prefs = await userService.getUserPreferences(userId);
  return createSuccessResponse(prefs);
}

async function handlePatch(
  userId: string,
  data: z.infer<typeof UpdateSchema>,
  userService: UserService
) {
  const result = await userService.updateUserPreferences(userId, data as any);
  if (!result.success || !result.preferences) {
    throw mapUserServiceError(new Error(result.error || 'update failed'));
  }
  return createSuccessResponse(result.preferences);
}

export const GET = createApiHandler(
  emptySchema,
  async (_req, { userId }, _data, services) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return handleGet(userId, services.user);
  },
  { requireAuth: true }
);

export const PATCH = createApiHandler(
  UpdateSchema,
  async (_req, { userId }, data, services) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return handlePatch(userId, data, services.user);
  },
  { requireAuth: true }
);
