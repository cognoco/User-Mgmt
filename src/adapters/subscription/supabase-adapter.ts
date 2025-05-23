/**
 * Supabase implementation of the SubscriptionDataProvider
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ISubscriptionDataProvider } from '@/core/subscription/ISubscriptionDataProvider';
import type { SubscriptionPlan, UserSubscription } from '../../core/subscription/models';

export class SupabaseSubscriptionAdapter implements ISubscriptionDataProvider {
  private supabase: SupabaseClient;

  constructor(private supabaseUrl: string, private supabaseKey: string) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await this.supabase.from('subscription_plans').select('*').eq('is_active', true);
    if (error || !data) return [];
    return data.map((p: any) => this.mapPlan(p));
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return this.mapSubscription(data);
  }

  async upsertSubscription(sub: Partial<UserSubscription> & { userId: string; planId: string }): Promise<UserSubscription> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .upsert({
        id: sub.id,
        user_id: sub.userId,
        plan_id: sub.planId,
        status: sub.status,
        start_date: sub.startDate,
        end_date: sub.endDate,
        renewal_date: sub.renewalDate,
        canceled_at: sub.canceledAt,
        payment_method: sub.paymentMethod,
        metadata: sub.metadata,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error || !data) {
      throw new Error(error?.message || 'Failed to upsert subscription');
    }
    return this.mapSubscription(data);
  }

  private mapPlan(p: any): SubscriptionPlan {
    return {
      id: p.id,
      name: p.name,
      tier: p.tier,
      price: p.price,
      period: p.period,
      features: p.features || [],
      isPublic: p.is_public ?? true,
      trialDays: p.trial_days ?? 0,
      metadata: p.metadata || {},
    } as SubscriptionPlan;
  }

  private mapSubscription(s: any): UserSubscription {
    return {
      id: s.id,
      userId: s.user_id,
      planId: s.plan_id,
      status: s.status,
      startDate: s.start_date,
      endDate: s.end_date,
      renewalDate: s.renewal_date,
      canceledAt: s.canceled_at,
      paymentMethod: s.payment_method,
      paymentProviderData: s.payment_provider_data,
      metadata: s.metadata,
    } as UserSubscription;
  }
}
