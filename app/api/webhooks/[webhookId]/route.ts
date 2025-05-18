import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
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

    // Get Supabase instance
    const supabase = getServiceSupabase();

    // Fetch the webhook
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .select('id, name, url, events, is_active, created_at, updated_at')
      .eq('id', webhookId)
      .eq('user_id', user.id)
      .single();

    if (error || !webhook) {
      console.error('Error fetching webhook or webhook not found:', error);
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    return NextResponse.json(webhook);
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

    // Get Supabase instance
    const supabase = getServiceSupabase();

    // First verify that the webhook exists and belongs to the user
    const { data: webhookData, error: fetchError } = await supabase
      .from('webhooks')
      .select('id, name, url')
      .eq('id', webhookId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !webhookData) {
      console.error('Error fetching webhook or webhook not found:', fetchError);
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Prepare update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (url !== undefined) updateData.url = url;
    if (events !== undefined) updateData.events = events;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    // Generate new secret if requested
    let newSecret: string | undefined;
    if (regenerate_secret) {
      newSecret = crypto.randomBytes(32).toString('hex');
      updateData.secret = newSecret;
    }

    // Update the webhook
    const { data, error: updateError } = await supabase
      .from('webhooks')
      .update(updateData)
      .eq('id', webhookId)
      .eq('user_id', user.id)
      .select('id, name, url, events, is_active, created_at, updated_at')
      .single();

    if (updateError) {
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
        name: data.name, 
        url: data.url,
        secret_regenerated: regenerate_secret === true
      }
    });

    // Return the updated webhook (including the new secret if it was regenerated)
    const response = {
      ...data,
      ...(newSecret ? { secret: newSecret } : {})
    };

    return NextResponse.json(response);
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

    // Get Supabase instance
    const supabase = getServiceSupabase();

    // First verify that the webhook exists and belongs to the user
    const { data: webhookData, error: fetchError } = await supabase
      .from('webhooks')
      .select('id, name, url')
      .eq('id', webhookId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !webhookData) {
      console.error('Error fetching webhook or webhook not found:', fetchError);
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Delete the webhook
    const { error: deleteError } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId)
      .eq('user_id', user.id);

    if (deleteError) {
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