/**
 * Auth Domain Error Handler
 * 
 * Specialized error handling for the auth domain.
 * This module provides error handling specific to authentication and authorization.
 */

import { ApiError, ERROR_CODES } from '../common';

/**
 * Create an invalid credentials error
 */
export function createInvalidCredentialsError(message = 'Invalid email or password') {
  return new ApiError(
    ERROR_CODES.INVALID_CREDENTIALS,
    message,
    401
  );
}

/**
 * Create an email not verified error
 */
export function createEmailNotVerifiedError(message = 'Email not verified') {
  return new ApiError(
    ERROR_CODES.EMAIL_NOT_VERIFIED,
    message,
    403
  );
}

/**
 * Create an MFA required error
 */
export function createMfaRequiredError(message = 'Multi-factor authentication required', details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.MFA_REQUIRED,
    message,
    403,
    details
  );
}

/**
 * Create an account locked error
 */
export function createAccountLockedError(message = 'Account is locked', details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.ACCOUNT_LOCKED,
    message,
    403,
    details
  );
}

/**
 * Create a password expired error
 */
export function createPasswordExpiredError(message = 'Password has expired and must be changed') {
  return new ApiError(
    ERROR_CODES.PASSWORD_EXPIRED,
    message,
    403
  );
}

/**
 * Create a session expired error
 */
export function createSessionExpiredError(message = 'Session has expired, please log in again') {
  return new ApiError(
    ERROR_CODES.SESSION_EXPIRED,
    message,
    401
  );
}

/**
 * Map auth service errors to API errors
 * 
 * This function maps errors from the auth service to standardized API errors.
 * It handles common error cases from the auth service and converts them to
 * the appropriate API error with the correct status code.
 */
export function mapAuthServiceError(error: Error): ApiError {
  // Check for specific error types based on message or error code
  const message = error.message.toLowerCase();
  
  if (message.includes('invalid credentials') || message.includes('invalid email or password')) {
    return createInvalidCredentialsError();
  }
  
  if (message.includes('email not verified')) {
    return createEmailNotVerifiedError();
  }
  
  if (message.includes('mfa required') || message.includes('multi-factor')) {
    return createMfaRequiredError();
  }
  
  if (message.includes('account locked') || message.includes('too many attempts')) {
    return createAccountLockedError();
  }
  
  if (message.includes('password expired') || message.includes('password reset required')) {
    return createPasswordExpiredError();
  }
  
  if (message.includes('session expired') || message.includes('session invalid')) {
    return createSessionExpiredError();
  }
  
  // Default to a server error if no specific mapping is found
  return new ApiError(
    ERROR_CODES.INTERNAL_ERROR,
    'An unexpected authentication error occurred',
    500
  );
}
