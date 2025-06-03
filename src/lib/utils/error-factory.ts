// Application-wide error factory and utilities
import { VALIDATION_ERROR_CODES, AUTH_ERROR_CODES, SERVER_ERROR_CODES, USER_ERROR_CODES } from '@/lib/api/common/error-codes';
import type { ErrorCode } from '@/lib/api/common/error-codes';
import type { LanguageCode } from '@/lib/i18n';
import { formatErrorMessage } from '@/lib/i18n/messages';

export interface ApplicationError extends Error {
  code: ErrorCode;
  details?: Record<string, any>;
  status?: number;
  timestamp: string;
  requestId?: string;
  cause?: unknown;
}

/**
 * Lookup a localized message for the given error code and locale.
 */
function getLocalizedMessage(code: ErrorCode, locale: LanguageCode): string | undefined {
  const msg = formatErrorMessage(code, {}, locale);
  return msg === `errors.${code}` ? undefined : msg;
}

/**
 * Create a basic ApplicationError instance.
 */
export function createError(
  code: ErrorCode,
  message: string,
  details?: Record<string, any>,
  cause?: unknown,
  httpStatus?: number
): ApplicationError {
  const err = new Error(message) as ApplicationError;
  err.name = 'ApplicationError';
  err.code = code;
  err.details = details;
  err.status = httpStatus;
  err.timestamp = new Date().toISOString();
  err.cause = cause;
  if (cause instanceof Error && cause.stack) {
    err.stack = `${err.stack}\nCaused by: ${cause.stack}`;
  }
  return err;
}

/**
 * Create a validation error with optional field level details.
 */
export function createValidationError(
  fieldErrors: Record<string, string>,
  message?: string,
  cause?: unknown,
  locale: LanguageCode = 'en'
) {
  let msg = message;
  if (!msg) {
    msg = getLocalizedMessage(VALIDATION_ERROR_CODES.INVALID_REQUEST, locale);
  }
  /* c8 ignore next */
  if (!msg) {
    msg = 'Validation failed.';
  }
  return createError(
    VALIDATION_ERROR_CODES.INVALID_REQUEST,
    msg,
    { fields: fieldErrors },
    cause,
    400
  );
}

/**
 * Create an authentication error.
 */
export function createAuthenticationError(
  message: string,
  cause?: unknown,
  locale: LanguageCode = 'en'
) {
  let msg = message;
  if (!msg) {
    msg = getLocalizedMessage(AUTH_ERROR_CODES.UNAUTHORIZED, locale);
  }
  /* c8 ignore next */
  if (!msg) {
    msg = 'Authentication required.';
  }
  return createError(AUTH_ERROR_CODES.UNAUTHORIZED, msg, undefined, cause, 401);
}

/**
 * Create a not found error for a given resource.
 */
export function createNotFoundError(
  resourceType: string,
  resourceId: string,
  cause?: unknown,
  locale: LanguageCode = 'en'
) {
  const code = USER_ERROR_CODES.NOT_FOUND;
  let msg = getLocalizedMessage(code, locale);
  if (!msg) {
    msg = `${resourceType} ${resourceId} not found`;
  }
  return createError(code, msg, { resourceType, resourceId }, cause, 404);
}

/**
 * Simple error enhancement - converts unknown errors to ApplicationError format
 */
export function enhanceError(error: unknown): Error {
  // If it's already an Error, return as-is
  if (error instanceof Error) {
    return error;
  }
  
  // If it's a string, create an Error from it
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  // For anything else, create a generic error
  return new Error('Unknown error occurred');
}
