import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { checkRateLimit } from '@/middleware/rate-limit';
import { getCurrentUser } from '@/lib/auth/session';

// GET handler to retrieve webhook delivery history
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
    
    // Get limit from query param (default to 10)
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Invalid limit parameter. Must be between 1 and 100.' }, { status: 400 });
    }

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Supabase instance
    const supabase = getServiceSupabase();

    // First verify that the webhook exists and belongs to the user
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('id')
      .eq('id', webhookId)
      .eq('user_id', user.id)
      .single();

    if (webhookError || !webhook) {
      console.error('Error fetching webhook or webhook not found:', webhookError);
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Fetch webhook deliveries
    const { data: deliveries, error } = await supabase
      .from('webhook_deliveries')
      .select('id, event_type, payload, status_code, response, error, created_at')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching webhook deliveries:', error);
      return NextResponse.json({ error: 'Failed to fetch webhook deliveries' }, { status: 500 });
    }

    return NextResponse.json({ deliveries });
  } catch (error) {
    console.error('Unexpected error in webhook deliveries GET:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 