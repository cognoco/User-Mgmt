import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getApiWebhookService } from '@/services/webhooks/factory';
import { checkRateLimit } from '@/middleware/rate-limit';
import { logUserAction } from '@/lib/audit/auditLogger';
import { getCurrentUser } from '@/lib/auth/session';
import crypto from 'crypto';

// Zod schema for webhook update
const UpdateWebhookSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(100).optional(),
  url: z.string().url({ message: 'Valid URL is required' }).optional(),
  events: z.array(z.string()).min(1, { message: 'At least one event must be selected' }).optional(),
  is_active: z.boolean().optional(),
  regenerate_secret: z.boolean().optional()
});

// GET handler to retrieve a specific webhook
export async function GET(
  request: NextRequest,
  { params }: { params: { webhookId: string } }
) {
  // Rate limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Extract webhook ID from URL
    const { webhookId } = params;

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = getApiWebhookService();
    const webhook = await service.getWebhook(user.id, webhookId);

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      is_active: webhook.isActive,
      created_at: webhook.createdAt,
      updated_at: webhook.updatedAt,
    });
  } catch (error) {
    console.error('Unexpected error in webhook GET:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

// PATCH handler to update a webhook
export async function PATCH(
  request: NextRequest,
  { params }: { params: { webhookId: string } }
) {
  // Get IP and User Agent
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Rate limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Extract webhook ID from URL
    const { webhookId } = params;

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = UpdateWebhookSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { name, url, events, is_active, regenerate_secret } = parseResult.data;

    const service = getApiWebhookService();

    // Update the webhook via service
    const { success, webhook, error: updateError } = await service.updateWebhook(
      user.id,
      webhookId,
      {
        name,
        url,
        events,
        isActive: is_active,
        regenerateSecret: regenerate_secret,
      }
    );

    if (!success || !webhook) {
      console.error('Error updating webhook:', updateError);
      return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 });
    }

    // Log the action
    await logUserAction({
      userId: user.id,
      action: 'WEBHOOK_UPDATED',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'webhook',
      targetResourceId: webhookId,
      details: {
        name: webhook.name,
        url: webhook.url,
        secret_regenerated: regenerate_secret === true
      }
    });

    // Return the updated webhook (including the new secret if it was regenerated)
    return NextResponse.json(webhook);
  } catch (error) {
    console.error('Unexpected error in webhook PATCH:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

// DELETE handler to delete a webhook
export async function DELETE(
  request: NextRequest,
  { params }: { params: { webhookId: string } }
) {
  // Get IP and User Agent
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Rate limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Extract webhook ID from URL
    const { webhookId } = params;

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = getApiWebhookService();
    const webhookData = await service.getWebhook(user.id, webhookId);
    if (!webhookData) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    const { success, error: deleteError } = await service.deleteWebhook(user.id, webhookId);

    if (!success) {
      console.error('Error deleting webhook:', deleteError);
      return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
    }

    // Log the action
    await logUserAction({
      userId: user.id,
      action: 'WEBHOOK_DELETED',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'webhook',
      targetResourceId: webhookId,
      details: {
        name: webhookData.name,
        url: webhookData.url
      }
    });

    return NextResponse.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    console.error('Unexpected error in webhook DELETE:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 