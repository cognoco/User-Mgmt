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
  USER_NOT_FOUND: 'User not found.',
  // Supabase specific error codes
  user_already_exists: 'An account with this email address already exists. Please try logging in instead.',
  email_exists: 'An account with this email address already exists. Please try logging in instead.',
  email_not_confirmed: 'Email not verified. Please check your email for a verification link.',
  signup_disabled: 'New account registration is currently disabled.',
  weak_password: 'Password is too weak. Please choose a stronger password.',
  invalid_credentials: 'Invalid email or password.',
  // Common Supabase error patterns
  'User already registered': 'An account with this email address already exists. Please try logging in instead.',
  'Email rate limit exceeded': 'Too many emails sent. Please wait before requesting another.',
  'Invalid login credentials': 'Invalid email or password.'
};

/**
 * Translate an unknown error into a user friendly message.
 *
 * @param error - Error object from API or network
 * @param options - Optional configuration
 * @returns Localized message describing the failure
 */
export function translateError(error: any, options: TranslateErrorOptions = {}): string {
  const code = error?.code || error?.response?.data?.code;
  if (code && ERROR_TRANSLATIONS[code]) {
    return ERROR_TRANSLATIONS[code];
  }
  
  const message = error?.response?.data?.error || error?.message;
  if (typeof message === 'string' && message.trim().length > 0) {
    // Check if the message matches any known patterns
    for (const [pattern, translation] of Object.entries(ERROR_TRANSLATIONS)) {
      if (message.includes(pattern) || message.toLowerCase().includes(pattern.toLowerCase())) {
        return translation;
      }
    }
    
    // Special handling for common Supabase error messages
    if (message.toLowerCase().includes('user already exists') || 
        message.toLowerCase().includes('email already exists') ||
        message.toLowerCase().includes('already registered')) {
      return 'An account with this email address already exists. Please try logging in instead.';
    }
    
    if (message.toLowerCase().includes('email not confirmed') ||
        message.toLowerCase().includes('email not verified')) {
      return 'Email not verified. Please check your email for a verification link.';
    }
    
    if (message.toLowerCase().includes('invalid login') ||
        message.toLowerCase().includes('invalid credentials')) {
      return 'Invalid email or password.';
    }
    
    return message;
  }
  
  return options.defaultMessage || 'An unexpected error occurred';
}
