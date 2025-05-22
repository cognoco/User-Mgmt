import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IWebhookDataProvider } from './IWebhookDataProvider';
import type { Webhook, WebhookCreatePayload } from '@/core/webhooks/models';

export class SupabaseWebhookProvider implements IWebhookDataProvider {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async listWebhooks(userId: string): Promise<Webhook[]> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return (data as Webhook[]) || [];
  }

  async createWebhook(userId: string, payload: WebhookCreatePayload): Promise<Webhook> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .insert({
        user_id: userId,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create webhook');
    }

    return data as Webhook;
  }

  async deleteWebhook(userId: string, webhookId: string): Promise<void> {
    const { error } = await this.supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }
}
