/**
 * SSO Domain Models
 *
 * This file defines the core entity models for the SSO domain.
 * These models represent SSO providers and related payloads.
 */

import { z } from 'zod';

/**
 * Supported SSO provider types
 */
export type SsoProviderType = 'saml' | 'oidc';

/**
 * SSO provider entity
 */
export interface SsoProvider {
  /** Unique identifier */
  id: string;
  /** Organization the provider belongs to */
  organizationId: string;
  /** Provider type (e.g. saml or oidc) */
  providerType: SsoProviderType;
  /** Name of the provider */
  providerName: string;
  /** Provider configuration stored as JSON */
  config: Record<string, any>;
  /** Whether the provider is active */
  isActive: boolean;
  /** Creation timestamp */
  createdAt?: string;
  /** Update timestamp */
  updatedAt?: string;
}

/**
 * Payload for creating/updating an SSO provider
 */
export interface SsoProviderPayload {
  organizationId: string;
  providerType: SsoProviderType;
  providerName: string;
  config: Record<string, any>;
}

// Validation schema used by API routes
export const ssoProviderSchema = z.object({
  organizationId: z.string().uuid(),
  providerType: z.enum(['saml', 'oidc']),
  providerName: z.string().min(1),
  config: z.record(z.any()),
});

export type SsoProviderData = z.infer<typeof ssoProviderSchema>;
