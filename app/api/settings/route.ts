import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { createSuccessResponse } from '@/lib/api/common';
import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import type { ServiceContainer } from '@/core/config/interfaces';
import { userPreferencesSchema } from '@/types/database';
import { mapUserServiceError } from '@/lib/api/user/error-handler';

const UpdateSchema = userPreferencesSchema
  .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
  .partial();

async function handleGet(
  _req: NextRequest,
  { userId }: { userId: string },
  _data: unknown,
  services: ServiceContainer
) {
  const prefs = await services.user.getUserPreferences(userId);
  return createSuccessResponse(prefs);
}

async function handlePatch(
  _req: NextRequest,
  { userId }: { userId: string },
  data: z.infer<typeof UpdateSchema>,
  services: ServiceContainer
) {
  const result = await services.user.updateUserPreferences(userId, data as any);
  if (!result.success || !result.preferences) {
    throw mapUserServiceError(new Error(result.error || 'update failed'));
  }
  return createSuccessResponse(result.preferences);
}

export const GET = createApiHandler(emptySchema, handleGet, { requireAuth: true });

export const PATCH = createApiHandler(UpdateSchema, handlePatch, { requireAuth: true });
