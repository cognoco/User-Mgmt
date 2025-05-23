/**
 * Subscription Data Provider Interface
 *
 * Defines the contract for persistence operations related to subscription management.
 * This abstraction allows the service layer to work with any data source.
 */
import type {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionUpsertPayload,
  SubscriptionQuery
} from './models';

export interface ISubscriptionDataProvider {
  /**
   * Fetch all available subscription plans.
   *
   * @returns Array of subscription plans
   */
  getPlans(): Promise<SubscriptionPlan[]>;

  /**
   * Retrieve the subscription for a specific user.
   *
   * @param userId Identifier of the user
   * @returns The user's subscription or null if none exists
   */
  getUserSubscription(userId: string): Promise<UserSubscription | null>;

  /**
   * Create a new subscription for the given user and plan.
   *
   * @param userId Identifier of the user
   * @param planId Identifier of the plan to subscribe to
   * @returns Result object containing success status and the created subscription or error information
   */
  createSubscription(
    userId: string,
    planId: string
  ): Promise<{ success: boolean; subscription?: UserSubscription; error?: string }>;

  /**
   * Update an existing subscription to a different plan.
   *
   * @param subscriptionId Identifier of the subscription to update
   * @param planId Identifier of the new plan
   * @returns Result object containing success status and the updated subscription or error information
   */
  updateSubscription(
    subscriptionId: string,
    planId: string
  ): Promise<{ success: boolean; subscription?: UserSubscription; error?: string }>;

  /**
   * Cancel a subscription.
   *
   * @param subscriptionId Identifier of the subscription to cancel
   * @param immediate If true, cancel immediately rather than at period end
   * @returns Result object containing success status or error information
   */
  cancelSubscription(
    subscriptionId: string,
    immediate?: boolean
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Insert or update a subscription record.
   *
   * This is primarily used when syncing with external billing systems
   * where the subscription state may already exist.
   *
   * @param data Subscription fields to persist
   * @returns The upserted subscription
   */
  upsertSubscription(data: SubscriptionUpsertPayload): Promise<UserSubscription>;

  /**
   * Retrieve subscriptions using optional filtering and pagination.
   *
   * @param query Query parameters for filtering and pagination
   * @returns Matching subscriptions with total count
   */
  listSubscriptions(query: SubscriptionQuery): Promise<{
    subscriptions: UserSubscription[];
    count: number;
  }>;
}
