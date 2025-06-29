import type { IWebhookService } from '@/core/webhooks/IWebhookService';
import type { IWebhookDataProvider } from '@/core/webhooks/IWebhookDataProvider';
import { WebhookService } from '@/services/webhooks/WebhookService';

export interface WebhookServiceConfig {
  webhookDataProvider: IWebhookDataProvider;
}

export function createWebhookService(config: WebhookServiceConfig): IWebhookService {
  return new WebhookService(config.webhookDataProvider);
}

export default { createWebhookService };

