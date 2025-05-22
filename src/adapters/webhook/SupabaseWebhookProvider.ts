import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  IWebhookDataProvider,
  Webhook,
  WebhookCreatePayload,
  WebhookUpdatePayload
} from './IWebhookDataProvider';

export class SupabaseWebhookProvider implements IWebhookDataProvider {
  private supabase: SupabaseClient;

  constructor(private supabaseUrl: string, private supabaseKey: string) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  async listWebhooks(userId: string): Promise<Webhook[]> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data.map(r => this.mapRecord(r));
  }

  async getWebhook(id: string): Promise<Webhook | null> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return this.mapRecord(data);
  }

  async createWebhook(userId: string, payload: WebhookCreatePayload): Promise<Webhook> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .insert({
        user_id: userId,
        url: payload.url,
        events: payload.events,
        secret: payload.secret,
        is_active: payload.isActive ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create webhook');
    }
    return this.mapRecord(data);
  }

  async updateWebhook(id: string, payload: WebhookUpdatePayload): Promise<Webhook | null> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .update({
        url: payload.url,
        events: payload.events,
        secret: payload.secret,
        is_active: payload.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRecord(data);
  }

  async deleteWebhook(id: string): Promise<void> {
    const { error } = await this.supabase.from('webhooks').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  }

  private mapRecord(record: any): Webhook {
    return {
      id: record.id,
      userId: record.user_id,
      url: record.url,
      events: record.events,
      secret: record.secret,
      isActive: record.is_active,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    };
  }
}
