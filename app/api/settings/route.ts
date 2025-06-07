import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { createSuccessResponse } from '@/lib/api/common';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import type { UserService } from '@/core/user/interfaces';
import { userPreferencesSchema } from '@/types/database';
import { mapUserServiceError } from '@/lib/api/user/errorHandler';

const UpdateSchema = userPreferencesSchema
  .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
  .partial();

async function handleGet(_req: NextRequest, userId: string, _data: unknown, userService: UserService) {
  const prefs = await userService.getUserPreferences(userId);
  return createSuccessResponse(prefs);
}

async function handlePatch(
  _req: NextRequest,
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
  (req, ctx, data, services) => handleGet(req, ctx.userId!, data, services.user),
  { requireAuth: true }
);

export const PATCH = createApiHandler(
  UpdateSchema,
  (req, ctx, data, services) => handlePatch(req, ctx.userId!, data, services.user),
  { requireAuth: true }
);
