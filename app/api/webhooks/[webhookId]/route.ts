import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers'
import { createSuccessResponse, createServerError, ApiError, ERROR_CODES } from '@/lib/api/common'
import { checkRateLimit } from '@/middleware/rateLimit'
import { logUserAction } from '@/lib/audit/auditLogger'
import { webhookUpdateSchema } from '@/core/webhooks/models/webhook'
import { getServiceContainer } from '@/lib/config/serviceContainer'

const updateSchema = webhookUpdateSchema

async function handleGet(req: NextRequest, ctx: any, _data: unknown, params: Promise<{ webhookId: string }>) {
  
  const { webhookId } = await params;
  if (await checkRateLimit(req)) {
    throw new ApiError(ERROR_CODES.OPERATION_FAILED, 'Too many requests', 429)
  }
  const service = getServiceContainer().webhook!
  const hook = await service.getWebhook(ctx.userId!, webhookId)
  if (!hook) {
    throw new ApiError(ERROR_CODES.NOT_FOUND, 'Webhook not found', 404)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { secret: _s, ...safe } = hook
  return createSuccessResponse(safe)
}

async function handlePatch(
  req: NextRequest,
  ctx: any,
  data: z.infer<typeof updateSchema>,
  params: Promise<{ webhookId: string }>,
) {
  
  const { webhookId } = await params;
  if (await checkRateLimit(req)) {
    throw new ApiError(ERROR_CODES.OPERATION_FAILED, 'Too many requests', 429)
  }
  const service = getServiceContainer().webhook!
  const result = await service.updateWebhook(ctx.userId!, webhookId, {
    name: data.name,
    url: data.url,
    events: data.events,
    isActive: data.isActive,
    regenerateSecret: data.regenerateSecret,
  })
  if (!result.success || !result.webhook) {
    throw createServerError(result.error || 'Failed to update webhook')
  }
  await logUserAction({
    userId: ctx.userId,
    action: 'WEBHOOK_UPDATED',
    status: 'SUCCESS',
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    targetResourceType: 'webhook',
    targetResourceId: webhookId,
    details: {
      name: result.webhook.name,
      url: result.webhook.url,
      secret_regenerated: data.regenerateSecret === true,
    },
  })
  return createSuccessResponse(result.webhook)
}

async function handleDelete(
  req: NextRequest,
  ctx: any,
  _data: unknown,
  params: Promise<{ webhookId: string }>,
) {
  
  const { webhookId } = await params;
  if (await checkRateLimit(req)) {
    throw new ApiError(ERROR_CODES.OPERATION_FAILED, 'Too many requests', 429)
  }
  const service = getServiceContainer().webhook!
  const existing = await service.getWebhook(ctx.userId!, webhookId)
  if (!existing) {
    throw new ApiError(ERROR_CODES.NOT_FOUND, 'Webhook not found', 404)
  }
  const result = await service.deleteWebhook(ctx.userId!, webhookId)
  if (!result.success) {
    throw createServerError(result.error || 'Failed to delete webhook')
  }
  await logUserAction({
    userId: ctx.userId,
    action: 'WEBHOOK_DELETED',
    status: 'SUCCESS',
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    targetResourceType: 'webhook',
    targetResourceId: webhookId,
    details: { name: existing.name, url: existing.url },
  })
  return createSuccessResponse({ message: 'Webhook deleted successfully' })
}

export const GET = (req: NextRequest, ctx: { params: Promise<{ webhookId: string }> }) =>
  createApiHandler(emptySchema, (r, auth) => handleGet(r, auth, {}, ctx.params), { requireAuth: true })(req)

export const PATCH = (req: NextRequest, ctx: { params: Promise<{ webhookId: string }> }) =>
  createApiHandler(updateSchema, (r, auth, data) => handlePatch(r, auth, data, ctx.params), { requireAuth: true })(req)

export const DELETE = (req: NextRequest, ctx: { params: Promise<{ webhookId: string }> }) =>
  createApiHandler(emptySchema, (r, auth, data) => handleDelete(r, auth, data, ctx.params), { requireAuth: true })(req)
