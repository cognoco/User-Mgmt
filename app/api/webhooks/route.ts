import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getApiWebhookService } from '@/services/webhooks/factory';
import { checkRateLimit } from '@/middleware/rate-limit';
import { logUserAction } from '@/lib/audit/auditLogger';
import { getCurrentUser } from '@/lib/auth/session';
import crypto from 'crypto';
import {
  createSuccessResponse,
  createCreatedResponse,
  createValidationError,
  createUnauthorizedError,
  createServerError,
  createForbiddenError,
  ApiError,
  ERROR_CODES,
} from '@/lib/api/common';

// Zod schema for webhook creation
const CreateWebhookSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(100),
  url: z.string().url({ message: 'Valid URL is required' }),
  events: z.array(z.string()).min(1, { message: 'At least one event must be selected' }),
  is_active: z.boolean().optional().default(true)
});

// GET handler to list webhooks for the current user
export async function GET(request: NextRequest) {
  // Rate limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Too many requests', 429);
  }

  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      throw createUnauthorizedError();
    }

    const service = getApiWebhookService();
    const webhooks = await service.getWebhooks(user.id);
    return createSuccessResponse({ webhooks });
  } catch (error) {
    console.error('Unexpected error in webhooks GET:', error);
    throw createServerError('An internal server error occurred');
  }
}

// POST handler to create a new webhook
export async function POST(request: NextRequest) {
  // Get IP and User Agent
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Rate limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Too many requests', 429);
  }

  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      throw createUnauthorizedError();
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      throw createValidationError('Invalid request body');
    }

    const parseResult = CreateWebhookSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw createValidationError('Validation failed', { errors });
    }

    const { name, url, events, is_active } = parseResult.data;

    const service = getApiWebhookService();
    const { success, webhook, error } = await service.createWebhook(user.id, {
      name,
      url,
      events,
      isActive: is_active ?? true,
    });

    if (!success || !webhook) {
      console.error('Error creating webhook:', error);
      throw createServerError('Failed to create webhook');
    }

    // Log the action
    await logUserAction({
      userId: user.id,
      action: 'WEBHOOK_CREATED',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'webhook',
      targetResourceId: webhook.id,
      details: { name: webhook.name, url: webhook.url }
    });

    // Return the webhook details (including the secret, which should only be shown once)
    return createCreatedResponse(webhook);
  } catch (error) {
    console.error('Unexpected error in webhooks POST:', error);
    throw createServerError('An internal server error occurred');
  }
}
// DELETE handler to remove a webhook
export async function DELETE(request: NextRequest) {
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Too many requests', 429);
  }

  const user = await getCurrentUser();
  if (!user) {
    throw createUnauthorizedError();
  }

  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    throw createValidationError('Invalid request body');
  }

  const id = body?.id;
  if (!id) {
    throw createValidationError('Webhook id required');
  }

  const service = getApiWebhookService();
  const { success, error } = await service.deleteWebhook(user.id, id);
  if (!success) {
    console.error('Error deleting webhook:', error);
    throw createServerError('Failed to delete webhook');
  }

  await logUserAction({
    userId: user.id,
    action: 'WEBHOOK_DELETED',
    status: 'SUCCESS',
    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    targetResourceType: 'webhook',
    targetResourceId: id,
    details: { id }
  });

  return createSuccessResponse({ success: true });
}
