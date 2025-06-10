/**
 * Webhook Domain Events
 *
 * This stub exists for future webhook event definitions and mirrors the
 * structure used by other domains. Concrete events should extend the base
 * `WebhookEvent` interface when implemented.
 */

export interface WebhookEvent {
  /** Event type identifier */
  type: string;

  /** Timestamp when the event occurred */
  timestamp: number;
}
