import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiCsrfService } from '@/services/csrf/factory';
import { ApiError } from '@/lib/api/common';
import { z } from 'zod';

const tokenSchema = z.object({ token: z.string() });

/** Generate CSRF token */
const generateHandler = createApiHandler({
  methods: ['GET'],
  async handler() {
    const service = getApiCsrfService();
    const result = await service.createToken();
    if (!result.success || !result.token) {
      throw new ApiError(500, result.error || 'Failed to create token');
    }
    return { token: result.token.token };
  }
});

/** Validate CSRF token */
const validateHandler = createApiHandler({
  methods: ['POST'],
  async handler(req) {
    const parse = tokenSchema.safeParse(req.body);
    if (!parse.success) throw new ApiError(400, 'Token required');
    const service = getApiCsrfService();
    return service.validateToken(parse.data.token);
  }
});

/** Revoke CSRF token */
const revokeHandler = createApiHandler({
  methods: ['DELETE'],
  async handler(req) {
    const parse = tokenSchema.safeParse(req.body);
    if (!parse.success) throw new ApiError(400, 'Token required');
    const service = getApiCsrfService();
    return service.revokeToken(parse.data.token);
  }
});

export default function handler(req: any, res: any) {
  const [action] = (req.query.csrf as string[]) || [];
  switch (req.method) {
    case 'GET':
      return generateHandler(req, res);
    case 'POST':
      if (action === 'validate') return validateHandler(req, res);
      return res.status(404).json({ error: 'Not Found' });
    case 'DELETE':
      if (action === 'revoke') return revokeHandler(req, res);
      return res.status(404).json({ error: 'Not Found' });
    default:
      return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
