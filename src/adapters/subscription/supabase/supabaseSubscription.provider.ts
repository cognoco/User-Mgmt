import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ISubscriptionDataProvider } from '@/core/subscription/ISubscriptionDataProvider';
import type {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionUpsertPayload,
  SubscriptionQuery
} from '@/core/subscription/models';

/**
 * Supabase implementation of {@link ISubscriptionDataProvider}.
 * Handles persistence of subscription plans and user subscriptions.
 */
export class SupabaseSubscriptionProvider implements ISubscriptionDataProvider {
  private supabase: SupabaseClient;

  constructor(private supabaseUrl: string, private supabaseKey: string) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  /** @inheritdoc */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true);

    if (error || !data) return [];
    return data.map((p: any) => this.mapPlan(p));
  }

  /** @inheritdoc */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapSubscription(data);
  }

  /** @inheritdoc */
  async upsertSubscription(sub: SubscriptionUpsertPayload): Promise<UserSubscription> {
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
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to upsert subscription');
    }
    return this.mapSubscription(data);
  }

  /** @inheritdoc */
  async createSubscription(
    userId: string,
    planId: string
  ): Promise<{ success: boolean; subscription?: UserSubscription; error?: string }> {
    try {
      const subscription = await this.upsertSubscription({
        userId,
        planId,
        status: 'active' as any,
        startDate: new Date().toISOString()
      });
      return { success: true, subscription };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /** @inheritdoc */
  async updateSubscription(
    subscriptionId: string,
    planId: string
  ): Promise<{ success: boolean; subscription?: UserSubscription; error?: string }> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({ plan_id: planId, updated_at: new Date().toISOString() })
      .eq('id', subscriptionId)
      .select('*')
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: error?.message };
    }
    return { success: true, subscription: this.mapSubscription(data) };
  }

  /** @inheritdoc */
  async cancelSubscription(
    subscriptionId: string,
    immediate?: boolean
  ): Promise<{ success: boolean; error?: string }> {
    const updates: Record<string, any> = {
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (immediate) {
      updates.end_date = new Date().toISOString();
    }

    const { error } = await this.supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  /** @inheritdoc */
  async listSubscriptions(query: SubscriptionQuery): Promise<{
    subscriptions: UserSubscription[];
    count: number;
  }> {
    let req = this.supabase.from('subscriptions').select('*', { count: 'exact' });
    if (query.userId) req = req.eq('user_id', query.userId);
    if (query.planId) req = req.eq('plan_id', query.planId);
    if (query.status) req = req.eq('status', query.status);
    if (query.sortBy)
      req = req.order(query.sortBy as string, { ascending: query.sortOrder !== 'desc' });

    if (query.limit && query.page) {
      const from = (query.page - 1) * query.limit;
      const to = from + query.limit - 1;
      req = req.range(from, to);
    } else if (query.limit) {
      req = req.limit(query.limit);
    }

    const { data, error, count } = await req;
    if (error || !data) {
      return { subscriptions: [], count: 0 };
    }
    return { subscriptions: data.map((s: any) => this.mapSubscription(s)), count: count ?? data.length };
  }

  /** Convert raw plan record to domain model */
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
      metadata: p.metadata || {}
    } as SubscriptionPlan;
  }

  /** Convert raw subscription record to domain model */
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
      metadata: s.metadata
    } as UserSubscription;
  }
}

export default SupabaseSubscriptionProvider;
