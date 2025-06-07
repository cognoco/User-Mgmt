/**
 * Subscription Service Interface
 */
import type { SubscriptionPlan, UserSubscription, SubscriptionUpsertPayload } from "@/core/subscription/models";

/**
 * Service managing user subscription plans.
 */
export interface SubscriptionService {
  /**
   * Fetch all available subscription plans
   */
  /** Retrieve all available subscription plans */
  getPlans(): Promise<SubscriptionPlan[]>;

  /**
   * Get a subscription for a user
   * @param userId User identifier
   */
  /**
   * Get the current subscription for a user.
   *
   * @param userId Identifier of the user
   */
  getUserSubscription(userId: string): Promise<UserSubscription | null>;

  /**
   * Create a new subscription for a user
   */
  /**
   * Create a subscription for a user and plan.
   */
  createSubscription(
    userId: string,
    planId: string,
  ): Promise<{
    success: boolean;
    subscription?: UserSubscription;
    error?: string;
  }>;

  /**
   * Cancel an existing subscription
   */
  /**
   * Cancel an active subscription.
   */
  cancelSubscription(
    subscriptionId: string,
    immediate?: boolean,
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Update a subscription's plan
   */
  /**
   * Change the plan of an existing subscription.
   */
  updateSubscription(
    subscriptionId: string,
    planId: string,
  ): Promise<{
    success: boolean;
    subscription?: UserSubscription;
    error?: string;
  }>;

  /**
   * Reconcile subscription state with external billing system.
   */
  reconcileSubscription(
    data: SubscriptionUpsertPayload
  ): Promise<UserSubscription>;
}
