import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withRouteAuth } from '@/middleware/auth';
import { withValidation } from '@/middleware/validation';
import { getApiUserService } from '@/services/user/factory';
import { userPreferencesSchema } from '@/types/database';
import { mapUserServiceError } from '@/lib/api/user/error-handler';

const UpdateSchema = userPreferencesSchema
  .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
  .partial();

async function handleGet(_req: NextRequest, userId: string) {
  const userService = getApiUserService();
  const prefs = await userService.getUserPreferences(userId);
  return createSuccessResponse(prefs);
}

async function handlePatch(
  _req: NextRequest,
  userId: string,
  data: z.infer<typeof UpdateSchema>
) {
  const userService = getApiUserService();
  const result = await userService.updateUserPreferences(userId, data as any);
  if (!result.success || !result.preferences) {
    throw mapUserServiceError(new Error(result.error || 'update failed'));
  }
  return createSuccessResponse(result.preferences);
}

export async function GET(request: NextRequest) {
  return withErrorHandling(
    (req) => withRouteAuth((r, uid) => handleGet(r, uid), req),
    request
  );
}

export async function PATCH(request: NextRequest) {
  return withErrorHandling(
    (req) =>
      withRouteAuth(
        (r, uid) =>
          withValidation(UpdateSchema, (r2, data) => handlePatch(r2, uid, data), r),
        req
      ),
    request
  );
}
