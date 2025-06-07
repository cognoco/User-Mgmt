import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers'
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common'
import { checkRateLimit } from '@/middleware/rateLimit'
import { getServiceContainer } from '@/lib/config/serviceContainer'

const querySchema = z.object({ limit: z.coerce.number().int().min(1).max(100).optional() })

async function handleGet(req: NextRequest, ctx: any, data: z.infer<typeof querySchema>, params: { webhookId: string }) {
  if (await checkRateLimit(req)) {
    throw new ApiError(ERROR_CODES.OPERATION_FAILED, 'Too many requests', 429)
  }
  const service = getServiceContainer().webhook!
  const hook = await service.getWebhook(ctx.userId!, params.webhookId)
  if (!hook) {
    throw new ApiError(ERROR_CODES.NOT_FOUND, 'Webhook not found', 404)
  }
  const deliveries = await service.getWebhookDeliveries(ctx.userId!, params.webhookId, data.limit ?? 10)
  return createSuccessResponse({ deliveries })
}

export const GET = (req: NextRequest, ctx: { params: { webhookId: string } }) =>
  createApiHandler(querySchema, (r, auth, q) => handleGet(r, auth, q, ctx.params), { requireAuth: true })(req)
