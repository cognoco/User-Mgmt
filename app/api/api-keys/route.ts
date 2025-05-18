import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import { logUserAction } from '@/lib/audit/auditLogger';
import { getCurrentUser } from '@/lib/auth/session';
import { generateApiKey } from '@/lib/api-keys/api-key-utils';

// Zod schema for API key creation
const CreateApiKeySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(100),
  scopes: z.array(z.string()),
  expiresAt: z.string().datetime().optional()
});

// GET handler to list API keys for the current user
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

    // Fetch API keys for the user (excluding the actual key hash)
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, name, prefix, scopes, expires_at, last_used_at, created_at, is_revoked')
      .eq('user_id', user.id)
      .eq('is_revoked', false);

    if (error) {
      console.error('Error fetching API keys:', error);
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }

    return NextResponse.json({ keys: apiKeys });
  } catch (error) {
    console.error('Unexpected error in API keys GET:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

// POST handler to create a new API key
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

    const parseResult = CreateApiKeySchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { name, scopes, expiresAt } = parseResult.data;

    // Generate API key
    const { key, hashedKey, prefix } = generateApiKey();

    // Insert API key into database
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        key_hash: hashedKey,
        prefix,
        scopes,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_revoked: false
      })
      .select('id, name, prefix, scopes, expires_at, created_at')
      .single();

    if (error) {
      console.error('Error creating API key:', error);
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
    }

    // Log the action
    await logUserAction({
      userId: user.id,
      action: 'API_KEY_CREATED',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'api_key',
      targetResourceId: data.id,
      details: { name: data.name, prefix: data.prefix }
    });

    // Return the API key details (including the actual key which should only be shown once)
    return NextResponse.json({
      ...data,
      key // Include the plaintext key in the response (only time it will be available)
    });
  } catch (error) {
    console.error('Unexpected error in API keys POST:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 