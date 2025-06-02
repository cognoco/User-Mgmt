// Application-wide error factory and utilities
import { VALIDATION_ERROR_CODES, AUTH_ERROR_CODES, SERVER_ERROR_CODES, USER_ERROR_CODES } from '@/lib/api/common/error-codes';
import type { ErrorCode } from '@/lib/api/common/error-codes';

export interface ApplicationError extends Error {
  code: ErrorCode;
  details?: Record<string, any>;
  status?: number;
  timestamp: string;
  requestId?: string;
  cause?: unknown;
}

/**
 * Map of localized messages by locale and error code.
 * Only English translations are provided currently but the structure
 * allows adding more locales easily.
 */
const LOCALIZED_MESSAGES: Record<string, Record<string, string>> = {
  en: {
    [AUTH_ERROR_CODES.UNAUTHORIZED]: 'Authentication required.',
    [AUTH_ERROR_CODES.FORBIDDEN]: 'Access denied.',
    [VALIDATION_ERROR_CODES.INVALID_REQUEST]: 'Validation failed.',
    [USER_ERROR_CODES.NOT_FOUND]: 'Resource not found.',
    [SERVER_ERROR_CODES.INTERNAL_ERROR]: 'Internal server error.',
  },
};

function getLocalizedMessage(code: ErrorCode, locale: string): string | undefined {
  return LOCALIZED_MESSAGES[locale]?.[code] || LOCALIZED_MESSAGES.en[code];
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
  locale = 'en'
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
  locale = 'en'
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
  locale = 'en'
) {
  const code = USER_ERROR_CODES.NOT_FOUND;
  const defaultMsg = `${resourceType} ${resourceId} not found`;
  const msg = getLocalizedMessage(code, locale) || defaultMsg;
  return createError(code as ErrorCode, msg, { resourceType, resourceId }, cause, 404);
}
