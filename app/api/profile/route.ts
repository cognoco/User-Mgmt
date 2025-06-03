import { z } from 'zod';
import { createSuccessResponse } from '@/lib/api/common';
import { createApiHandler } from '@/lib/api/route-helpers';
import { getConfiguredUserService } from '@/services/user';
import {
  createUserNotFoundError,
  createUserUpdateFailedError
} from '@/lib/api/user/error-handler';
import { profileSchema } from '@/types/database';

const UpdateSchema = profileSchema
  .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
  .partial();

export const GET = createApiHandler(
  z.object({}),
  async (_req, { userId }, _data, services) => {
    const profile = await services.user.getUserProfile(userId);
    if (!profile) {
      throw createUserNotFoundError(userId);
    }
    return createSuccessResponse(profile);
  },
  {
    requireAuth: true,
    services: {
      user: getConfiguredUserService()
    }
  }
);

export const PATCH = createApiHandler(
  UpdateSchema,
  async (_req, { userId }, data, services) => {
    const result = await services.user.updateUserProfile(userId, data as any);
    if (!result.success || !result.profile) {
      throw createUserUpdateFailedError(result.error);
    }
    return createSuccessResponse(result.profile);
  },
  {
    requireAuth: true,
    services: {
      user: getConfiguredUserService()
    }
  }
);
