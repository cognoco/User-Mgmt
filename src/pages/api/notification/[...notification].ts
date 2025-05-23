import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiNotificationService } from '@/services/notification/factory';
import { ApiError } from '@/lib/api/common';
import { z } from 'zod';

const listSchema = z.object({ userId: z.string().uuid() });

/**
 * GET /api/notification/list
 */
const listNotificationsHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const parse = listSchema.safeParse(req.query);
    if (!parse.success) {
      throw new ApiError(400, 'Invalid parameters');
    }
    const service = getApiNotificationService();
    const batch = await service.getUserNotifications(parse.data.userId);
    return batch;
  }
});

export default function handler(req: any, res: any) {
  const [action] = (req.query.notification as string[]) || [];
  switch (action) {
    case 'list':
      return listNotificationsHandler(req, res);
    default:
      return res.status(404).json({ error: 'Not Found' });
  }
}
