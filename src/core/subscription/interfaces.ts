/**
 * Subscription Service Interface
 */
import type { SubscriptionPlan, UserSubscription } from './models';

export interface SubscriptionService {
  /**
   * Fetch all available subscription plans
   */
  getPlans(): Promise<SubscriptionPlan[]>;

  /**
   * Get a subscription for a user
   * @param userId User identifier
   */
  getUserSubscription(userId: string): Promise<UserSubscription | null>;

  /**
   * Create a new subscription for a user
   */
  createSubscription(userId: string, planId: string): Promise<UserSubscription>;

  /**
   * Cancel an existing subscription
   */
  cancelSubscription(subscriptionId: string, immediate?: boolean): Promise<void>;

  /**
   * Update a subscription's plan
   */
  updateSubscription(subscriptionId: string, planId: string): Promise<UserSubscription>;
}
