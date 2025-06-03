import { z } from 'zod';
import { NextRequest } from 'next/server';

import { createApiHandler } from '@/lib/api/route-helpers';
import { getApiUserService } from '@/services/user/factory';
import { createSuccessResponse } from '@/lib/api/common';

// Schema for profile updates
const updateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
});

// GET handler
export const GET = createApiHandler(
  z.object({}),
  async (_req, { userId }) => {
    const userService = getApiUserService();
    const profile = await userService.getUserProfile(userId);
    return createSuccessResponse(profile);
  },
  { requireAuth: true }
);

// PATCH handler
export const PATCH = createApiHandler(
  updateSchema,
  async (_req, { userId }, data) => {
    const userService = getApiUserService();
    const result = await userService.updateUserProfile(userId, data);
    return createSuccessResponse(result.profile);
  },
  { requireAuth: true }
);
