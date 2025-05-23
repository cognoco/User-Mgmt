import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  IWebhookDataProvider,
  Webhook,
  WebhookCreatePayload,
  WebhookUpdatePayload
} from '../../core/webhooks/IWebhookDataProvider';
import type { WebhookDelivery } from '@/core/webhooks/models';

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

  async getWebhook(userId: string, id: string): Promise<Webhook | null> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return this.mapRecord(data);
  }

  async createWebhook(
    userId: string,
    payload: WebhookCreatePayload
  ): Promise<{ success: boolean; webhook?: Webhook; error?: string }> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .insert({
        user_id: userId,
        name: payload.name,
        url: payload.url,
        events: payload.events,
        secret: '',
        is_active: payload.isActive ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to create webhook' };
    }
    return { success: true, webhook: this.mapRecord(data) };
  }

  async updateWebhook(
    userId: string,
    id: string,
    payload: WebhookUpdatePayload
  ): Promise<{ success: boolean; webhook?: Webhook; error?: string }> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .update({
        name: payload.name,
        url: payload.url,
        events: payload.events,
        is_active: payload.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (error || !data) return { success: false, error: error?.message };
    return { success: true, webhook: this.mapRecord(data) };
  }

  async deleteWebhook(
    userId: string,
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase
      .from('webhooks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  async listDeliveries(
    userId: string,
    webhookId: string,
    limit = 10
  ): Promise<WebhookDelivery[]> {
    const { data, error } = await this.supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as WebhookDelivery[];
  }

  async recordDelivery(delivery: WebhookDelivery): Promise<void> {
    await this.supabase.from('webhook_deliveries').insert({
      id: delivery.id,
      webhook_id: delivery.webhookId,
      event_type: delivery.eventType,
      payload: delivery.payload,
      status_code: delivery.statusCode,
      response: delivery.response,
      error: delivery.error,
      created_at: delivery.createdAt
    });
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
