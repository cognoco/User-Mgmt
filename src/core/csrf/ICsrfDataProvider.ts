/**
 * CSRF Data Provider Interface
 *
 * Defines the contract for persistence operations related to CSRF tokens.
 * This allows the adapter layer to implement any storage mechanism while
 * keeping the core logic database agnostic.
 */
import type { CsrfToken } from './models';

export interface ICsrfDataProvider {
  /**
   * Create a new CSRF token.
   *
   * @returns Result object containing the token or an error message.
   */
  createToken(): Promise<{ success: boolean; token?: CsrfToken; error?: string }>;

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
}
