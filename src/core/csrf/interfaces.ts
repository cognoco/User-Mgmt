import { CsrfToken } from "@/core/csrf/models";

/**
 * Service responsible for managing CSRF tokens.
 *
 * Expected failures such as invalid tokens should be reflected in the
 * returned result objects. Promises reject only on unexpected errors.
 */
export interface CsrfService {
  /** Create a new token */
  createToken(): Promise<{
    success: boolean;
    token?: CsrfToken;
    error?: string;
  }>;

  /** Validate an existing token */
  validateToken(token: string): Promise<{ valid: boolean; error?: string }>;

  /** Revoke a token */
  revokeToken(token: string): Promise<{ success: boolean; error?: string }>;
}
