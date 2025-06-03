import { z } from 'zod';
import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import { createSuccessResponse } from '@/lib/api/common';

// Schema for profile updates
const updateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
});

// GET handler - Fetch user profile
export const GET = createApiHandler(
  emptySchema,
  async (_request, { userId }, _data, services) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const profile = await services.user.getUserProfile(userId);
    return createSuccessResponse(profile);
  },
  { requireAuth: true }
);

// PATCH handler - Update user profile
export const PATCH = createApiHandler(
  updateSchema,
  async (_request, { userId }, data, services) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const result = await services.user.updateUserProfile(userId, data);
    return createSuccessResponse(result.profile);
  },
  { requireAuth: true }
);
