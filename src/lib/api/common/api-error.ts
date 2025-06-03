/**
 * API Error Handling
 * 
 * Standardized error handling for API responses across all domains.
 * This module provides consistent error formatting and status code mapping.
 */

import { ERROR_CODES, ErrorCode } from './error-codes';
import { getErrorStatus, getErrorCategory, ErrorCategory } from '../error-handler';

/**
 * API Error class for standardized error responses returned from API routes.
 * Use the helper functions in this module instead of instantiating directly.
 */
export class ApiError extends Error {
  code: ErrorCode;
  status: number;
  category: ErrorCategory;
  details?: Record<string, any>;

  constructor(
    /** error code that identifies the failure */
    code: ErrorCode,
    /** human readable message */
    message: string,
    /** optional HTTP status override */
    status?: number,
    /** optional structured details */
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status ?? getErrorStatus(code);
    this.category = getErrorCategory(code);
    this.details = details;
  }

  /**
   * Convert the error to a JSON response body compatible with the API spec.
   */
  toResponse() {
    return {
      error: {
        code: this.code,
        message: this.message,
        category: this.category,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * Map of error codes to HTTP status codes
 */

/**
 * Create an unauthorized error
 */
/**
 * Helper for `401 Unauthorized` errors.
 */
export function createUnauthorizedError(message = 'Authentication required') {
  return new ApiError(
    ERROR_CODES.UNAUTHORIZED,
    message,
    getErrorStatus(ERROR_CODES.UNAUTHORIZED)
  );
}

/**
 * Create a forbidden error
 */
/**
 * Helper for `403 Forbidden` errors.
 */
export function createForbiddenError(message = 'Access denied') {
  return new ApiError(
    ERROR_CODES.FORBIDDEN,
    message,
    getErrorStatus(ERROR_CODES.FORBIDDEN)
  );
}

/**
 * Create a validation error
 */
/**
 * Helper for validation failures.
 */
export function createValidationError(message: string, details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.INVALID_REQUEST,
    message,
    getErrorStatus(ERROR_CODES.INVALID_REQUEST),
    details
  );
}

/**
 * Create a not found error
 */
/**
 * Helper for `404 Not Found` errors.
 */
export function createNotFoundError(entity: string, id?: string) {
  const message = id
    ? `${entity} with ID ${id} not found`
    : `${entity} not found`;
  
  return new ApiError(
    ERROR_CODES.NOT_FOUND,
    message,
    getErrorStatus(ERROR_CODES.NOT_FOUND)
  );
}

/**
 * Create a server error
 */
/**
 * Helper for generic `500` server errors.
 */
export function createServerError(message = 'Internal server error') {
  return new ApiError(
    ERROR_CODES.INTERNAL_ERROR,
    message,
    getErrorStatus(ERROR_CODES.INTERNAL_ERROR)
  );
}

/**
 * Create a conflict error
 */
/**
 * Helper for `409 Conflict` errors.
 */
export function createConflictError(message: string) {
  return new ApiError(
    ERROR_CODES.ALREADY_EXISTS,
    message,
    getErrorStatus(ERROR_CODES.ALREADY_EXISTS)
  );
}

/** Billing-related error helpers */
export function createPaymentFailedError(message: string, details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.PAYMENT_FAILED,
    message,
    getErrorStatus(ERROR_CODES.PAYMENT_FAILED),
    details
  );
}

export function createBillingProviderError(message: string, details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.PROVIDER_ERROR,
    message,
    getErrorStatus(ERROR_CODES.PROVIDER_ERROR),
    details
  );
}

export function createBillingPermissionError(message = 'Billing permission denied') {
  return new ApiError(
    ERROR_CODES.PERMISSION_DENIED,
    message,
    getErrorStatus(ERROR_CODES.PERMISSION_DENIED)
  );
}

export function createStateMismatchError(message: string, details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.STATE_MISMATCH,
    message,
    getErrorStatus(ERROR_CODES.STATE_MISMATCH),
    details
  );
}
