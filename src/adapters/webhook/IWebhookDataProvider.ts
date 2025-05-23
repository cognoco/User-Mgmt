export interface Webhook {
  id: string;
  userId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookCreatePayload {
  url: string;
  events: string[];
  secret: string;
  isActive?: boolean;
}

export interface WebhookUpdatePayload {
  url?: string;
  events?: string[];
  secret?: string;
  isActive?: boolean;
}

import type { WebhookDelivery } from '@/core/webhooks/models';

export interface IWebhookDataProvider {
  listWebhooks(userId: string): Promise<Webhook[]>;
  getWebhook(userId: string, webhookId: string): Promise<Webhook | null>;
  createWebhook(
    userId: string,
    data: WebhookCreatePayload
  ): Promise<{ success: boolean; webhook?: Webhook; error?: string }>;
  updateWebhook(
    userId: string,
    webhookId: string,
    data: WebhookUpdatePayload
  ): Promise<{ success: boolean; webhook?: Webhook; error?: string }>;
  deleteWebhook(
    userId: string,
    webhookId: string
  ): Promise<{ success: boolean; error?: string }>;
  listDeliveries(
    userId: string,
    webhookId: string,
    limit?: number
  ): Promise<WebhookDelivery[]>;
  recordDelivery(delivery: WebhookDelivery): Promise<void>;
}
