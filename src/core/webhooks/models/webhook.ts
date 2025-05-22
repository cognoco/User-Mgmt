/**
 * Webhook entity and payload definitions
 */
import { z } from 'zod';

/** Basic webhook record */
export interface Webhook {
  /** Unique identifier */
  id: string;
  /** Owner of the webhook */
  userId: string;
  /** Friendly name */
  name: string;
  /** Target URL */
  url: string;
  /** Events this webhook subscribes to */
  events: string[];
  /** Secret used for signing */
  secret: string;
  /** Whether the webhook is active */
  isActive: boolean;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt?: string;
}

/** Payload for creating a webhook */
export const webhookCreateSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  url: z.string().url({ message: 'Valid URL is required' }),
  events: z.array(z.string()).min(1, { message: 'At least one event is required' }),
  isActive: z.boolean().optional().default(true)
});
export type WebhookCreatePayload = z.infer<typeof webhookCreateSchema>;

/** Payload for updating a webhook */
export const webhookUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
  regenerateSecret: z.boolean().optional()
});
export type WebhookUpdatePayload = z.infer<typeof webhookUpdateSchema>;
