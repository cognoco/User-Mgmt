/**
 * API Error Handling
 * 
 * Standardized error handling for API responses across all domains.
 * This module provides consistent error formatting and status code mapping.
 */

import { ERROR_CODES, ErrorCode } from './error-codes';
import { getErrorStatus, getErrorCategory, ErrorCategory } from '../error-handler';

/**
 * API Error class for standardized error responses
 */
export class ApiError extends Error {
  code: ErrorCode;
  status: number;
  category: ErrorCategory;
  details?: Record<string, any>;

  constructor(
    code: ErrorCode,
    message: string,
    status?: number,
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
   * Convert the error to a response object
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
export function createConflictError(message: string) {
  return new ApiError(
    ERROR_CODES.ALREADY_EXISTS,
    message,
    getErrorStatus(ERROR_CODES.ALREADY_EXISTS)
  );
}
