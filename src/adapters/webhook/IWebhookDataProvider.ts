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

export interface IWebhookDataProvider {
  listWebhooks(userId: string): Promise<Webhook[]>;
  getWebhook(id: string): Promise<Webhook | null>;
  createWebhook(userId: string, data: WebhookCreatePayload): Promise<Webhook>;
  updateWebhook(id: string, data: WebhookUpdatePayload): Promise<Webhook | null>;
  deleteWebhook(id: string): Promise<void>;
}
