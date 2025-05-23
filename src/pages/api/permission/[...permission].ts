import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiPermissionService } from '@/services/permission/factory';
import { ApiError } from '@/lib/api/common';
import { z } from 'zod';

const checkSchema = z.object({
  userId: z.string().uuid(),
  permission: z.string().min(1)
});

/**
 * GET /api/permission/check
 */
const checkHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const parse = checkSchema.safeParse(req.query);
    if (!parse.success) {
      throw new ApiError(400, 'Invalid parameters');
    }
    const service = getApiPermissionService();
    const has = await service.hasPermission(parse.data.userId, parse.data.permission as any);
    return { hasPermission: has };
  }
});

export default function handler(req: any, res: any) {
  const [action] = (req.query.permission as string[]) || [];
  switch (action) {
    case 'check':
      return checkHandler(req, res);
    default:
      return res.status(404).json({ error: 'Not Found' });
  }
}
