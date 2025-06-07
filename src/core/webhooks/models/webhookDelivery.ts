/**
 * Webhook delivery record
 */
export interface WebhookDelivery {
  /** Unique delivery identifier */
  id: string;
  /** Related webhook id */
  webhookId: string;
  /** Event type that triggered the delivery */
  eventType: string;
  /** Payload sent */
  payload: unknown;
  /** HTTP status code returned by target */
  statusCode?: number;
  /** Response body */
  response?: string;
  /** Error message if delivery failed */
  error?: string;
  /** Timestamp when delivery occurred */
  createdAt: string;
}
