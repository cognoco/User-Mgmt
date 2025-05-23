import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiUserService } from '@/services/user/factory';
import { ApiError } from '@/lib/api/common';
import { z } from 'zod';

const searchSchema = z.object({ query: z.string().min(1) });

/**
 * GET /api/user/search
 */
const searchHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const parse = searchSchema.safeParse(req.query);
    if (!parse.success) {
      throw new ApiError(400, 'Invalid search query');
    }
    const userService = getApiUserService();
    const result = await userService.searchUsers({ query: parse.data.query });
    return result;
  }
});

export default function handler(req: any, res: any) {
  const [action] = (req.query.user as string[]) || [];
  switch (action) {
    case 'search':
      return searchHandler(req, res);
    default:
      return res.status(404).json({ error: 'Not Found' });
  }
}
