import type { AxiosInstance } from 'axios';
import type { IWebhookService } from '@/core/webhooks/IWebhookService';
import type { IWebhookDataProvider } from '@/adapters/webhooks/IWebhookDataProvider';
import { WebhookService } from './WebhookService';

export interface WebhookServiceConfig {
  apiClient: AxiosInstance;
  webhookDataProvider: IWebhookDataProvider;
}

export function createWebhookService(config: WebhookServiceConfig): IWebhookService {
  return new WebhookService(config.apiClient, config.webhookDataProvider);
}

export default { createWebhookService };
