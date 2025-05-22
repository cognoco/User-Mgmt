/**
 * API Error Handling
 * 
 * Standardized error handling for API responses across all domains.
 * This module provides consistent error formatting and status code mapping.
 */

import { ERROR_CODES, ErrorCode } from './error-codes';

/**
 * API Error class for standardized error responses
 */
export class ApiError extends Error {
  code: ErrorCode;
  status: number;
  details?: Record<string, any>;

  constructor(
    code: ErrorCode,
    message: string,
    status: number = 400,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
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
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * Map of error codes to HTTP status codes
 */
export const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  // Auth errors
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.INVALID_CREDENTIALS]: 401,
  [ERROR_CODES.EMAIL_NOT_VERIFIED]: 403,
  [ERROR_CODES.MFA_REQUIRED]: 403,
  [ERROR_CODES.ACCOUNT_LOCKED]: 403,
  [ERROR_CODES.PASSWORD_EXPIRED]: 403,
  [ERROR_CODES.SESSION_EXPIRED]: 401,

  // User errors
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.ALREADY_EXISTS]: 409,
  [ERROR_CODES.INVALID_DATA]: 400,
  [ERROR_CODES.UPDATE_FAILED]: 500,
  [ERROR_CODES.DELETE_FAILED]: 500,

  // Team errors
  [ERROR_CODES.MEMBER_NOT_FOUND]: 404,
  [ERROR_CODES.MEMBER_ALREADY_EXISTS]: 409,

  // Validation errors
  [ERROR_CODES.INVALID_REQUEST]: 400,
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 400,
  [ERROR_CODES.INVALID_FORMAT]: 400,

  // Server errors
  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 503,
  [ERROR_CODES.DATABASE_ERROR]: 500,
} as const;

/**
 * Create an unauthorized error
 */
export function createUnauthorizedError(message = 'Authentication required') {
  return new ApiError(
    ERROR_CODES.UNAUTHORIZED,
    message,
    ERROR_STATUS_MAP[ERROR_CODES.UNAUTHORIZED]
  );
}

/**
 * Create a forbidden error
 */
export function createForbiddenError(message = 'Access denied') {
  return new ApiError(
    ERROR_CODES.FORBIDDEN,
    message,
    ERROR_STATUS_MAP[ERROR_CODES.FORBIDDEN]
  );
}

/**
 * Create a validation error
 */
export function createValidationError(message: string, details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.INVALID_REQUEST,
    message,
    ERROR_STATUS_MAP[ERROR_CODES.INVALID_REQUEST],
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
    ERROR_STATUS_MAP[ERROR_CODES.NOT_FOUND]
  );
}

/**
 * Create a server error
 */
export function createServerError(message = 'Internal server error') {
  return new ApiError(
    ERROR_CODES.INTERNAL_ERROR,
    message,
    ERROR_STATUS_MAP[ERROR_CODES.INTERNAL_ERROR]
  );
}

/**
 * Create a conflict error
 */
export function createConflictError(message: string) {
  return new ApiError(
    ERROR_CODES.ALREADY_EXISTS,
    message,
    ERROR_STATUS_MAP[ERROR_CODES.ALREADY_EXISTS]
  );
}
