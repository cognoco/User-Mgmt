import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withRouteAuth } from '@/middleware/auth';
import { withValidation } from '@/middleware/validation';
import { getApiUserService } from '@/services/user/factory';
import { profileSchema } from '@/types/database';
import {
  createUserNotFoundError,
  createUserUpdateFailedError,
  mapUserServiceError
} from '@/lib/api/user/error-handler';

const UpdateSchema = profileSchema
  .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
  .partial();

async function handleGet(_req: NextRequest, userId: string) {
  const userService = getApiUserService();
  const profile = await userService.getUserProfile(userId);
  if (!profile) {
    throw createUserNotFoundError(userId);
  }
  return createSuccessResponse(profile);
}

async function handlePatch(
  _req: NextRequest,
  userId: string,
  data: z.infer<typeof UpdateSchema>
) {
  const userService = getApiUserService();
  const result = await userService.updateUserProfile(userId, data as any);
  if (!result.success || !result.profile) {
    throw createUserUpdateFailedError(result.error);
  }
  return createSuccessResponse(result.profile);
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
