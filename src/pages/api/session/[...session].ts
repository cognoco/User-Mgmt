import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiSessionService } from '@/services/session/factory';
import { ApiError } from '@/lib/api/common';
import { z } from 'zod';

const listSchema = z.object({ userId: z.string().uuid() });

/**
 * GET /api/session/list
 */
const listHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const parse = listSchema.safeParse(req.query);
    if (!parse.success) {
      throw new ApiError(400, 'Invalid parameters');
    }
    const service = getApiSessionService();
    const sessions = await service.listUserSessions(parse.data.userId);
    return { sessions };
  }
});

export default function handler(req: any, res: any) {
  const [action] = (req.query.session as string[]) || [];
  switch (action) {
    case 'list':
      return listHandler(req, res);
    default:
      return res.status(404).json({ error: 'Not Found' });
  }
}
