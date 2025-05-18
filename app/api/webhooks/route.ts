import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import { logUserAction } from '@/lib/audit/auditLogger';
import { getCurrentUser } from '@/lib/auth/session';
import crypto from 'crypto';

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
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
    }

    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('Unexpected error in webhooks GET:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
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
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
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

    const parseResult = CreateWebhookSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
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
      return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
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
    return NextResponse.json({
      ...data,
      secret // Include the secret in the response (only time it will be available)
    });
  } catch (error) {
    console.error('Unexpected error in webhooks POST:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 