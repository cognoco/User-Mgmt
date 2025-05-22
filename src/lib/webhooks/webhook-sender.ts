import crypto from 'crypto';
import type {
  IWebhookDataProvider,
  WebhookDelivery,
} from '@/core/webhooks';

interface WebhookPayload {
  event: string;
  data: unknown;
}

/** Result of a single webhook delivery */
interface WebhookDeliveryResult extends WebhookDelivery {
  /** Whether the delivery succeeded */
  success: boolean;
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
  provider: IWebhookDataProvider,
  delivery: WebhookDelivery
): Promise<void> {
  try {
    await provider.recordDelivery(delivery);
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
export interface WebhookSender {
  sendWebhookEvent(
    eventType: string,
    payload: unknown,
    userId: string
  ): Promise<WebhookDeliveryResult[]>;
  getWebhookDeliveries(
    userId: string,
    webhookId: string,
    limit?: number
  ): Promise<WebhookDelivery[]>;
}

export function createWebhookSender(
  provider: IWebhookDataProvider
): WebhookSender {
  async function sendWebhookEvent(
    eventType: string,
    payload: unknown,
    userId: string
  ): Promise<WebhookDeliveryResult[]> {
    const webhooks = await provider.listWebhooks(userId);
    const eligible = webhooks.filter(
      (w) => w.isActive && w.events.includes(eventType)
    );
    if (eligible.length === 0) {
      return [];
    }

    const fullPayload: WebhookPayload = { event: eventType, data: payload };
    const payloadStr = JSON.stringify(fullPayload);

    const results: WebhookDeliveryResult[] = [];

    await Promise.allSettled(
      eligible.map(async (webhook) => {
        try {
          const signature = signPayload(payloadStr, webhook.secret);
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

          const delivery: WebhookDelivery = {
            id:
              (crypto as any).randomUUID?.() ||
              crypto.randomBytes(16).toString('hex'),
            webhookId: webhook.id,
            eventType,
            payload: fullPayload,
            statusCode: response.status,
            response: responseText,
            createdAt: new Date().toISOString(),
            ...(response.ok
              ? {}
              : { error: `Failed with status: ${response.status}` })
          };

          await recordDelivery(provider, delivery);

          results.push({ ...delivery, success: response.ok });
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Unknown error delivering webhook';
          const delivery: WebhookDelivery = {
            id:
              (crypto as any).randomUUID?.() ||
              crypto.randomBytes(16).toString('hex'),
            webhookId: webhook.id,
            eventType,
            payload: fullPayload,
            error: errorMessage,
            createdAt: new Date().toISOString()
          };

          await recordDelivery(provider, delivery);
          results.push({ ...delivery, success: false });
        }
      })
    );

    return results;
  }

  async function getWebhookDeliveries(
    userId: string,
    webhookId: string,
    limit = 10
  ): Promise<WebhookDelivery[]> {
    return provider.listDeliveries(userId, webhookId, limit);
  }

  return { sendWebhookEvent, getWebhookDeliveries };
}
