import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiKeyService } from '@/services/api-keys/factory';
import { ApiError } from '@/lib/api/common';
import { apiKeyCreateSchema } from '@/core/api-keys/models';
import { z } from 'zod';

/**
 * Schema for listing API keys
 */
const listSchema = z.object({ userId: z.string().uuid() });

/**
 * Schema for creating an API key
 */
const createSchema = apiKeyCreateSchema.extend({ userId: z.string().uuid() });

/**
 * GET /api/api-keys
 * List API keys for a user
 */
const listHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const parse = listSchema.safeParse(req.query);
    if (!parse.success) {
      throw new ApiError(400, 'Invalid parameters');
    }
    const service = getApiKeyService();
    const keys = await service.listApiKeys(parse.data.userId);
    return { keys };
  }
});

/**
 * POST /api/api-keys
 * Create a new API key
 */
const createHandler = createApiHandler({
  methods: ['POST'],
  requiresAuth: true,
  async handler(req) {
    const parse = createSchema.safeParse(req.body);
    if (!parse.success) {
      throw new ApiError(400, 'Invalid payload', { details: parse.error.flatten() });
    }
    const { userId, ...payload } = parse.data;
    const service = getApiKeyService();
    const result = await service.createApiKey(userId, payload);
    if (!result.success || !result.key) {
      throw new ApiError(400, result.error || 'Failed to create key');
    }
    return { key: result.key, plaintext: result.plaintext };
  }
});

/**
 * DELETE /api/api-keys/[id]
 * Revoke an API key
 */
const revokeHandler = createApiHandler({
  methods: ['DELETE'],
  requiresAuth: true,
  async handler(req) {
    const segments = (req.query['api-keys'] as string[]) || [];
    const keyId = segments[0];
    const parse = listSchema.safeParse(req.query);
    if (!parse.success || !keyId) {
      throw new ApiError(400, 'Invalid parameters');
    }
    const service = getApiKeyService();
    const result = await service.revokeApiKey(parse.data.userId, keyId);
    if (!result.success) {
      throw new ApiError(400, result.error || 'Failed to revoke key');
    }
    return { key: result.key };
  }
});

export default function handler(req: any, res: any) {
  const method = req.method;
  const segments = (req.query['api-keys'] as string[]) || [];
  if (method === 'GET' && segments.length === 0) return listHandler(req, res);
  if (method === 'POST' && segments.length === 0) return createHandler(req, res);
  if (method === 'DELETE' && segments.length === 1) return revokeHandler(req, res);
  res.status(405).json({ error: 'Method Not Allowed' });
}
