import crypto from 'crypto';
import { getServiceSupabase } from '@/lib/database/supabase';

interface WebhookPayload {
  event: string;
  data: any;
}

interface WebhookDeliveryResult {
  success: boolean;
  webhookId: string;
  statusCode?: number;
  error?: string;
  response?: string;
}

/**
 * Signs the webhook payload using the webhook's secret
 * @param payload The webhook payload to sign
 * @param secret The webhook secret
 * @returns A signature string to be used in the X-Webhook-Signature header
 */
function signPayload(payload: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  return hmac.update(payload).digest('hex');
}

/**
 * Records a webhook delivery attempt in the database
 * @param webhookId The ID of the webhook
 * @param eventType The type of event
 * @param payload The payload that was sent
 * @param statusCode The HTTP status code from the response
 * @param response The response text
 * @param error Error message, if any
 */
async function recordDelivery(
  webhookId: string,
  eventType: string,
  payload: any,
  statusCode?: number,
  response?: string,
  error?: string
): Promise<void> {
  const supabase = getServiceSupabase();
  
  try {
    await supabase
      .from('webhook_deliveries')
      .insert({
        webhook_id: webhookId,
        event_type: eventType,
        payload,
        status_code: statusCode,
        response: response?.substring(0, 1000), // Limit response size
        error: error?.substring(0, 1000), // Limit error size
        created_at: new Date().toISOString()
      });
  } catch (err) {
    console.error('Failed to record webhook delivery:', err);
  }
}

/**
 * Sends an event to all webhooks registered for that event type
 * @param eventType The type of event to send
 * @param payload The event payload
 * @param userId Optional: If provided, only sends to webhooks owned by this user
 * @returns Array of delivery results
 */
export async function sendWebhookEvent(
  eventType: string,
  payload: any,
  userId?: string
): Promise<WebhookDeliveryResult[]> {
  const supabase = getServiceSupabase();
  
  // Query for eligible webhooks that are subscribed to this event type
  let query = supabase
    .from('webhooks')
    .select('id, url, secret')
    .contains('events', [eventType])
    .eq('is_active', true);
  
  // Add user filter if provided
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data: webhooks, error } = await query;
  
  if (error || !webhooks || webhooks.length === 0) {
    if (error) {
      console.error('Error fetching webhooks:', error);
    }
    return [];
  }
  
  const results: WebhookDeliveryResult[] = [];
  const completePayload: WebhookPayload = {
    event: eventType,
    data: payload
  };
  
  // Convert payload to JSON string for signing and sending
  const payloadStr = JSON.stringify(completePayload);
  
  // Send the event to each webhook in parallel
  const deliveryPromises = webhooks.map(async (webhook) => {
    try {
      // Sign the payload
      const signature = signPayload(payloadStr, webhook.secret);
      
      // Send the webhook request
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': eventType
        },
        body: payloadStr
      });
      
      const responseText = await response.text();
      const success = response.ok;
      
      // Record the delivery attempt
      await recordDelivery(
        webhook.id,
        eventType,
        completePayload,
        response.status,
        responseText,
        success ? undefined : `Failed with status: ${response.status}`
      );
      
      results.push({
        success,
        webhookId: webhook.id,
        statusCode: response.status,
        response: responseText
      });
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Unknown error delivering webhook';
      
      // Record the delivery failure
      await recordDelivery(
        webhook.id,
        eventType,
        completePayload,
        undefined,
        undefined,
        errorMessage
      );
      
      results.push({
        success: false,
        webhookId: webhook.id,
        error: errorMessage
      });
    }
  });
  
  await Promise.allSettled(deliveryPromises);
  return results;
}

/**
 * Gets the delivery history for a specific webhook
 * @param webhookId The ID of the webhook
 * @param limit The maximum number of deliveries to return (default: 10)
 * @returns Array of delivery records
 */
export async function getWebhookDeliveries(webhookId: string, limit = 10): Promise<any[]> {
  const supabase = getServiceSupabase();
  
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('id, event_type, status_code, created_at, error')
    .eq('webhook_id', webhookId)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Error fetching webhook deliveries:', error);
    return [];
  }
  
  return data || [];
} 