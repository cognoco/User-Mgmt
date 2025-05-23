import type { AxiosInstance } from 'axios';
import type { IWebhookService } from '@/core/webhooks/IWebhookService';
import type { IWebhookDataProvider } from '@/adapters/webhook/IWebhookDataProvider';
import type { Webhook, WebhookCreatePayload, WebhookUpdatePayload, WebhookDelivery } from '@/core/webhooks/models';

export class WebhookService implements IWebhookService {
  constructor(
    private apiClient: AxiosInstance,
    private dataProvider: IWebhookDataProvider
  ) {}

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
    return this.dataProvider.recordDelivery({
      id: '',
      webhookId: '',
      eventType,
      payload,
      createdAt: new Date().toISOString()
    }).then(() => []);
  }
}
