/**
 * API Key Domain Models
 */

import { z } from 'zod';

/** API key entity */
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  prefix: string;
  scopes: string[];
  expiresAt?: string | null;
  lastUsedAt?: string | null;
  createdAt: string;
  isRevoked: boolean;
}

/** Payload for creating an API key */
export const apiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()),
  expiresAt: z.string().datetime().optional()
});
export type ApiKeyCreatePayload = z.infer<typeof apiKeyCreateSchema>;

/** Result of API key creation */
export interface ApiKeyCreateResult {
  success: boolean;
  key?: ApiKey;
  plaintext?: string;
  error?: string;
}
