import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiSsoService } from '@/services/sso/factory';
import { ApiError } from '@/lib/api/common';
import { z } from 'zod';

const providerSchema = z.object({ organizationId: z.string().uuid() });

/**
 * GET /api/sso/providers
 */
const providersHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const parse = providerSchema.safeParse(req.query);
    if (!parse.success) {
      throw new ApiError(400, 'organizationId required');
    }
    const service = getApiSsoService();
    const providers = await service.getProviders(parse.data.organizationId);
    return { providers };
  }
});

export default function handler(req: any, res: any) {
  const [action] = (req.query.sso as string[]) || [];
  switch (action) {
    case 'providers':
      return providersHandler(req, res);
    default:
      return res.status(404).json({ error: 'Not Found' });
  }
}
