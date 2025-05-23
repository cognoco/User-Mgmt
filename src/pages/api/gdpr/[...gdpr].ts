import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiGdprService } from '@/services/gdpr/factory';
import { ApiError } from '@/lib/api/common';
import { z } from 'zod';

const userSchema = z.object({ userId: z.string().uuid() });

/** Export user data */
const exportHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const parse = userSchema.safeParse(req.query);
    if (!parse.success) throw new ApiError(400, 'Invalid parameters');
    const service = getApiGdprService();
    const data = await service.exportUserData(parse.data.userId);
    if (!data) throw new ApiError(404, 'Export not found');
    return data;
  }
});

/** Delete user account */
const deleteHandler = createApiHandler({
  methods: ['POST'],
  requiresAuth: true,
  async handler(req) {
    const parse = userSchema.safeParse(req.body);
    if (!parse.success) throw new ApiError(400, 'Invalid parameters');
    const service = getApiGdprService();
    const result = await service.deleteAccount(parse.data.userId);
    if (!result.success) throw new ApiError(400, result.error || 'Deletion failed');
    return { message: result.message };
  }
});

export default function handler(req: any, res: any) {
  const [action] = (req.query.gdpr as string[]) || [];
  switch(action){
    case 'export':
      return exportHandler(req,res);
    case 'delete':
      return deleteHandler(req,res);
    default:
      return res.status(404).json({ error: 'Not Found' });
  }
}
