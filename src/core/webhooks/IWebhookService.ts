/**
 * Webhook Service Interface
 *
 * Provides high level business logic for managing webhooks and sending events.
 * Methods should resolve with result objects describing business failures and
 * only reject on unexpected errors.
 */
import type {
  Webhook,
  WebhookCreatePayload,
  WebhookUpdatePayload,
  WebhookDelivery,
} from "@/core/webhooks/models";

export interface IWebhookService {
  /** Create a new webhook for the given user */
  createWebhook(
    userId: string,
    data: WebhookCreatePayload,
  ): Promise<{
    success: boolean;
    webhook?: Webhook;
    error?: string;
  }>;

  /** Return all webhooks belonging to the user */
  getWebhooks(userId: string): Promise<Webhook[]>;

  /** Get a single webhook by id */
  getWebhook(userId: string, webhookId: string): Promise<Webhook | null>;

  /** Update a webhook */
  updateWebhook(
    userId: string,
    webhookId: string,
    data: WebhookUpdatePayload,
  ): Promise<{ success: boolean; webhook?: Webhook; error?: string }>;

  /** Remove a webhook */
  deleteWebhook(
    userId: string,
    webhookId: string,
  ): Promise<{ success: boolean; error?: string }>;

  /** Get delivery history for a webhook */
  getWebhookDeliveries(
    userId: string,
    webhookId: string,
    limit?: number,
  ): Promise<WebhookDelivery[]>;

  /** Trigger an event for all matching webhooks */
  triggerEvent(
    eventType: string,
    payload: unknown,
    userId?: string,
  ): Promise<WebhookDelivery[]>;
}
