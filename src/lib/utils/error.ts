export interface TranslateErrorOptions {
  /** Default message if no specific message is found */
  defaultMessage?: string;
}

/**
 * Known error code translations
 */
const ERROR_TRANSLATIONS: Record<string, string> = {
  EMAIL_NOT_VERIFIED: 'Email not verified. Please verify your email.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  MFA_REQUIRED: 'Multi-factor authentication required.',
  TEAM_NOT_FOUND: 'Team not found.',
  USER_NOT_FOUND: 'User not found.'
};

/**
 * Translate an error object into a user-friendly message.
 * Falls back to the provided default message when no translation is found.
 */
export function translateError(error: any, options: TranslateErrorOptions = {}): string {
  const code = error?.code || error?.response?.data?.code;
  if (code && ERROR_TRANSLATIONS[code]) {
    return ERROR_TRANSLATIONS[code];
  }
  const message = error?.response?.data?.error || error?.message;
  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }
  return options.defaultMessage || 'An unexpected error occurred';
}
