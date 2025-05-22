/**
 * Webhook Data Provider Interface
 *
 * Defines the contract for persistence operations related to webhooks.
 */
import type {
  Webhook,
  WebhookCreatePayload,
  WebhookUpdatePayload,
  WebhookDelivery
} from './models';

export interface IWebhookDataProvider {
  /** List all webhooks for a user */
  listWebhooks(userId: string): Promise<Webhook[]>;

  /** Get a specific webhook owned by the user */
  getWebhook(userId: string, webhookId: string): Promise<Webhook | null>;

  /** Create a new webhook */
  createWebhook(userId: string, data: WebhookCreatePayload): Promise<{
    success: boolean;
    webhook?: Webhook;
    error?: string;
  }>;

  /** Update an existing webhook */
  updateWebhook(
    userId: string,
    webhookId: string,
    data: WebhookUpdatePayload
  ): Promise<{ success: boolean; webhook?: Webhook; error?: string }>;

  /** Delete a webhook */
  deleteWebhook(userId: string, webhookId: string): Promise<{ success: boolean; error?: string }>;

  /** List delivery history for a webhook */
  listDeliveries(userId: string, webhookId: string, limit?: number): Promise<WebhookDelivery[]>;

  /** Record a webhook delivery attempt */
  recordDelivery(delivery: WebhookDelivery): Promise<void>;
}
