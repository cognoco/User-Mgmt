import { NextRequest, NextResponse } from 'next/server';
import { getApiWebhookService } from '@/services/webhooks/factory';
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

    const service = getApiWebhookService();
    const webhook = await service.getWebhook(user.id, webhookId);
    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    const deliveries = await service.getWebhookDeliveries(user.id, webhookId, limit);
    return NextResponse.json({ deliveries });
  } catch (error) {
    console.error('Unexpected error in webhook deliveries GET:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 