import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import {
  createSuccessResponse,
  createCreatedResponse,
  createServerError,
  ApiError,
  ERROR_CODES,
} from '@/lib/api/common';
import { checkRateLimit } from '@/middleware/rate-limit';
import { logUserAction } from '@/lib/audit/auditLogger';

import { webhookCreateSchema } from '@/core/webhooks/models/webhook';
import { getServiceContainer } from '@/lib/config/service-container';

const createSchema = webhookCreateSchema;
const deleteSchema = z.object({ id: z.string() });

async function handleGet(req: NextRequest, ctx: any, _data: unknown) {
  if (await checkRateLimit(req)) {
    throw new ApiError(ERROR_CODES.OPERATION_FAILED, 'Too many requests', 429);
  }

  const service = getServiceContainer().webhook!;
  const hooks = await service.getWebhooks(ctx.userId!);
  const safe = hooks.map(({ secret, ...rest }) => rest);
  return createSuccessResponse({ webhooks: safe });
}

async function handlePost(req: NextRequest, ctx: any, data: z.infer<typeof createSchema>) {
  if (await checkRateLimit(req)) {
    throw new ApiError(ERROR_CODES.OPERATION_FAILED, 'Too many requests', 429);
  }

  const service = getServiceContainer().webhook!;
  const result = await service.createWebhook(ctx.userId!, {
    name: data.name,
    url: data.url,
    events: data.events,
    isActive: data.isActive ?? true,
  });

  if (!result.success || !result.webhook) {
    throw createServerError(result.error || 'Failed to create webhook');
  }

  await logUserAction({
    userId: ctx.userId,
    action: 'WEBHOOK_CREATED',
    status: 'SUCCESS',
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    targetResourceType: 'webhook',
    targetResourceId: result.webhook.id,
    details: { name: result.webhook.name, url: result.webhook.url },
  });

  return createCreatedResponse(result.webhook);
}

async function handleDelete(req: NextRequest, ctx: any, data: z.infer<typeof deleteSchema>) {
  if (await checkRateLimit(req)) {
    throw new ApiError(ERROR_CODES.OPERATION_FAILED, 'Too many requests', 429);
  }

  const service = getServiceContainer().webhook!;
  const result = await service.deleteWebhook(ctx.userId!, data.id);
  if (!result.success) {
    throw createServerError(result.error || 'Failed to delete webhook');
  }

  await logUserAction({
    userId: ctx.userId,
    action: 'WEBHOOK_DELETED',
    status: 'SUCCESS',
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    targetResourceType: 'webhook',
    targetResourceId: data.id,
  });

  return createSuccessResponse({ success: true });
}

export const GET = createApiHandler(emptySchema, handleGet, { requireAuth: true });
export const POST = createApiHandler(createSchema, handlePost, { requireAuth: true });
export const DELETE = createApiHandler(deleteSchema, handleDelete, { requireAuth: true });

