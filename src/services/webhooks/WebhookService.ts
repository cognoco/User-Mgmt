import type { AxiosInstance } from 'axios';
import type { IWebhookService } from '@/core/webhooks/IWebhookService';
import type { IWebhookDataProvider } from '@/adapters/webhooks/IWebhookDataProvider';
import type { Webhook, WebhookCreatePayload } from '@/core/webhooks/models';

export class WebhookService implements IWebhookService {
  constructor(
    private apiClient: AxiosInstance,
    private dataProvider: IWebhookDataProvider
  ) {}

  async listWebhooks(userId: string): Promise<Webhook[]> {
    return this.dataProvider.listWebhooks(userId);
  }

  async createWebhook(
    userId: string,
    payload: WebhookCreatePayload
  ): Promise<Webhook> {
    return this.dataProvider.createWebhook(userId, payload);
  }

  async deleteWebhook(userId: string, webhookId: string): Promise<void> {
    await this.dataProvider.deleteWebhook(userId, webhookId);
  }
}
