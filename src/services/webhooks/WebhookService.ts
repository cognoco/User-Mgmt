import type { IWebhookService } from '@/core/webhooks/IWebhookService';
import type { IWebhookDataProvider } from '@/core/webhooks/IWebhookDataProvider';
import type {
  Webhook,
  WebhookCreatePayload,
  WebhookUpdatePayload,
  WebhookDelivery,
} from '@/core/webhooks/models';
import { createWebhookSender } from '@/lib/webhooks/webhook-sender';

export class WebhookService implements IWebhookService {
  private sender;

  constructor(private dataProvider: IWebhookDataProvider) {
    this.sender = createWebhookSender(this.dataProvider);
  }

  async getWebhooks(userId: string): Promise<Webhook[]> {
    return this.dataProvider.listWebhooks(userId);
  }

  async getWebhook(userId: string, webhookId: string): Promise<Webhook | null> {
    return this.dataProvider.getWebhook(userId, webhookId);
  }

  async createWebhook(
    userId: string,
    payload: WebhookCreatePayload
  ): Promise<{ success: boolean; webhook?: Webhook; error?: string }> {
    return this.dataProvider.createWebhook(userId, payload);
  }

  async updateWebhook(
    userId: string,
    webhookId: string,
    payload: WebhookUpdatePayload
  ): Promise<{ success: boolean; webhook?: Webhook; error?: string }> {
    return this.dataProvider.updateWebhook(userId, webhookId, payload);
  }

  async deleteWebhook(
    userId: string,
    webhookId: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.dataProvider.deleteWebhook(userId, webhookId);
  }

  async getWebhookDeliveries(
    userId: string,
    webhookId: string,
    limit?: number
  ): Promise<WebhookDelivery[]> {
    return this.dataProvider.listDeliveries(userId, webhookId, limit);
  }

  async triggerEvent(
    eventType: string,
    payload: unknown,
    userId?: string
  ): Promise<WebhookDelivery[]> {
    if (!userId) {
      return [];
    }

    const results = await this.sender.sendWebhookEvent(eventType, payload, userId);
    // Strip success field before returning
    return results.map(({ success, ...delivery }) => delivery);
  }
}
