/**
 * CSRF Data Provider Interface
 *
 * Defines the contract for persistence operations related to CSRF tokens.
 * This allows the adapter layer to implement any storage mechanism while
 * keeping the core logic database agnostic.
 */
import type { PaginationMeta } from "@/lib/api/common/responseFormatter";
import type { CsrfToken, CsrfTokenQuery } from "@/src/core/csrf/models";

export interface ICsrfDataProvider {
  /**
   * Generate a raw CSRF token string without persisting it.
   *
   * @returns Newly generated token string
   */
  generateToken(): Promise<string>;

  /**
   * Create a new CSRF token.
   *
   * @returns Result object containing the token or an error message.
   */
  createToken(): Promise<{
    success: boolean;
    token?: CsrfToken;
    error?: string;
  }>;

  /**
   * Validate a CSRF token.
   *
   * @param token Token to validate
   * @returns Object indicating whether the token is valid or not.
   */
  validateToken(token: string): Promise<{ valid: boolean; error?: string }>;

  /**
   * Revoke an existing CSRF token.
   *
   * @param token Token to revoke
   * @returns Result object with success status or error.
   */
  revokeToken(token: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Retrieve a stored CSRF token by value.
   *
   * @param token - Token value to fetch
   * @returns The token record or null if not found
   */
  getToken(token: string): Promise<CsrfToken | null>;

  /**
   * Query tokens using filtering and pagination options.
   *
   * @param query - Query parameters for filtering and pagination
   * @returns Array of tokens with pagination metadata
   */
  listTokens(
    query: CsrfTokenQuery,
  ): Promise<{ tokens: CsrfToken[]; pagination: PaginationMeta }>;

  /**
   * Update an existing token record.
   *
   * @param token - Token value to update
   * @param data - Partial token fields to update
   * @returns Updated token or an error
   */
  updateToken(
    token: string,
    data: Partial<CsrfToken>,
  ): Promise<{ success: boolean; token?: CsrfToken; error?: string }>;

  /**
   * Remove expired tokens from storage.
   *
   * @returns Number of tokens removed and success status
   */
  purgeExpiredTokens(): Promise<{
    success: boolean;
    count: number;
    error?: string;
  }>;
}

/**
 * Convenience alias so services can import `CsrfDataProvider` instead of
 * the longer `ICsrfDataProvider` name.
 */
export type CsrfDataProvider = ICsrfDataProvider;
