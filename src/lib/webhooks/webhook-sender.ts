import crypto from 'crypto';
import { z } from 'zod';
import type {
  IWebhookDataProvider,
  WebhookDelivery,
} from '@/core/webhooks';
import { createError } from '@/core/common/errors';
import { WEBHOOK_ERROR } from '@/core/common/error-codes';

interface WebhookPayload {
  event: string;
  data: unknown;
}

const payloadSchema = z.object({
  event: z.string().min(1),
  data: z.any(),
});

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

async function deliverWithRetry(
  webhook: { id: string; url: string; secret: string },
  eventType: string,
  payloadStr: string,
  fullPayload: WebhookPayload,
  provider: IWebhookDataProvider,
  maxRetries = 2
): Promise<WebhookDeliveryResult> {
  const signature = signPayload(payloadStr, webhook.secret);
  let attempt = 0;
  let response: Response | null = null;
  let error: unknown = null;
  while (attempt <= maxRetries) {
    try {
      response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': eventType,
        },
        body: payloadStr,
      });
      if (response.ok) break;
      if (response.status >= 500 && attempt < maxRetries) {
        await sleep(2 ** attempt * 100);
        attempt++;
        continue;
      }
      break;
    } catch (err) {
      error = err;
      if (attempt < maxRetries) {
        await sleep(2 ** attempt * 100);
        attempt++;
        continue;
      }
      break;
    }
  }

  const id = (crypto as any).randomUUID?.() ||
    crypto.randomBytes(16).toString('hex');
  const base: WebhookDelivery = {
    id,
    webhookId: webhook.id,
    eventType,
    payload: fullPayload,
    createdAt: new Date().toISOString(),
  };

  if (response) {
    const text = await response.text();
    const delivery: WebhookDelivery = {
      ...base,
      statusCode: response.status,
      response: text,
      ...(response.ok
        ? {}
        : {
            error:
              response.status === 401 || response.status === 403
                ? 'Invalid signature'
                : `Failed with status: ${response.status}`,
          }),
    };
    await recordDelivery(provider, delivery);
    return { ...delivery, success: response.ok };
  }

  const message =
    error instanceof Error ? error.message : 'Network error delivering webhook';
  const delivery: WebhookDelivery = { ...base, error: message };
  await recordDelivery(provider, delivery);
  return { ...delivery, success: false };
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
    const parse = payloadSchema.safeParse({ event: eventType, data: payload });
    if (!parse.success) {
      throw createError(
        WEBHOOK_ERROR.WEBHOOK_001,
        'Invalid webhook payload',
        { issues: parse.error.issues },
        undefined,
        400
      );
    }

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
        const result = await deliverWithRetry(
          webhook,
          eventType,
          payloadStr,
          fullPayload,
          provider
        );
        results.push(result);
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
