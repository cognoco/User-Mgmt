import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiWebhookService } from '@/services/webhooks/factory';
import { ApiError } from '@/lib/api/common';
import { webhookCreateSchema, webhookUpdateSchema } from '@/core/webhooks/models/webhook';
import { z } from 'zod';

const userSchema = z.object({ userId: z.string().uuid() });

/** List webhooks */
const listHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const parse = userSchema.safeParse(req.query);
    if (!parse.success) throw new ApiError(400, 'Invalid parameters');
    const service = getApiWebhookService();
    const hooks = await service.getWebhooks(parse.data.userId);
    return { webhooks: hooks };
  }
});

/** Create webhook */
const createHandler = createApiHandler({
  methods: ['POST'],
  requiresAuth: true,
  async handler(req) {
    const data = webhookCreateSchema.extend({ userId: z.string().uuid() }).safeParse(req.body);
    if (!data.success) throw new ApiError(400, 'Invalid payload', { details: data.error.flatten() });
    const { userId, ...payload } = data.data;
    const service = getApiWebhookService();
    const result = await service.createWebhook(userId, payload);
    if (!result.success || !result.webhook) {
      throw new ApiError(400, result.error || 'Failed to create webhook');
    }
    return result.webhook;
  }
});

/** Delete webhook */
const deleteHandler = createApiHandler({
  methods: ['DELETE'],
  requiresAuth: true,
  async handler(req) {
    const segments = (req.query.webhook as string[]) || [];
    const id = segments[0];
    const parse = userSchema.safeParse(req.query);
    if (!parse.success || !id) throw new ApiError(400, 'Invalid parameters');
    const service = getApiWebhookService();
    const result = await service.deleteWebhook(parse.data.userId, id);
    if (!result.success) throw new ApiError(400, result.error || 'Delete failed');
    return { success: true };
  }
});

/** Update webhook */
const updateHandler = createApiHandler({
  methods: ['PATCH'],
  requiresAuth: true,
  async handler(req) {
    const segments = (req.query.webhook as string[]) || [];
    const id = segments[0];
    const parseQuery = userSchema.safeParse(req.query);
    const parseBody = webhookUpdateSchema.safeParse(req.body);
    if (!parseQuery.success || !parseBody.success || !id) {
      throw new ApiError(400, 'Invalid parameters');
    }
    const service = getApiWebhookService();
    const result = await service.updateWebhook(parseQuery.data.userId, id, parseBody.data);
    if (!result.success || !result.webhook) {
      throw new ApiError(400, result.error || 'Update failed');
    }
    return result.webhook;
  }
});

export default function handler(req: any, res: any) {
  const segments = (req.query.webhook as string[]) || [];
  if (segments.length === 0) {
    if (req.method === 'GET') return listHandler(req, res);
    if (req.method === 'POST') return createHandler(req, res);
  } else if (segments.length === 1) {
    if (req.method === 'DELETE') return deleteHandler(req, res);
    if (req.method === 'PATCH') return updateHandler(req, res);
  }
  res.status(405).json({ error: 'Method Not Allowed' });
}
