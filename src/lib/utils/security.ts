import DOMPurify from 'dompurify';

/**
 * Collection of security helper utilities.
 */
export const security = {
  /**
   * Sanitize potentially unsafe HTML using DOMPurify.
   *
   * @param dirty - Untrusted HTML string
   * @returns Sanitized HTML safe for insertion
   */
  sanitizeHTML: (dirty: string) => DOMPurify.sanitize(dirty),

  /**
   * Validate a string against a regular expression.
   *
   * @param input - Input value
   * @param pattern - Validation pattern
   */
  validateInput: (input: string, pattern: RegExp) => pattern.test(input),

  /**
   * Generate a random CSRF token.
   */
  generateCSRFToken: () => {
    // Implementation would depend on your backend
    return Math.random().toString(36).substring(2);
  },
};