import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
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

    // Get Supabase instance
    const supabase = getServiceSupabase();

    // Fetch webhooks for the user
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('id, name, url, events, is_active, created_at, updated_at')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching webhooks:', error);
      throw createServerError('Failed to fetch webhooks');
    }

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

    // Generate a webhook secret
    const secret = crypto.randomBytes(32).toString('hex');

    // Insert webhook into the database
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        user_id: user.id,
        name,
        url,
        events,
        secret,
        is_active: is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, name, url, events, is_active, created_at')
      .single();

    if (error) {
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
      targetResourceId: data.id,
      details: { name: data.name, url: data.url }
    });

    // Return the webhook details (including the secret, which should only be shown once)
    return createCreatedResponse({
      ...data,
      secret, // Include the secret in the response
    });
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

  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
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
