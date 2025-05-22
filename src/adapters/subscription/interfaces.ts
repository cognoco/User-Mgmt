/**
 * Subscription Data Provider Interface
 */
import type { SubscriptionPlan, UserSubscription } from '../../core/subscription/models';

export interface SubscriptionDataProvider {
  /** Fetch available subscription plans */
  getPlans(): Promise<SubscriptionPlan[]>;

  /** Fetch subscription for a user */
  getUserSubscription(userId: string): Promise<UserSubscription | null>;

  /** Upsert subscription record */
  upsertSubscription(subscription: Partial<UserSubscription> & { userId: string; planId: string }): Promise<UserSubscription>;
}
