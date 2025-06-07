/**
 * Admin Domain Error Handler
 * 
 * Specialized error handling for the admin domain.
 * This module provides error handling specific to admin operations.
 */

import { ApiError, ERROR_CODES } from '@/lib/api/common';

/**
 * Create an admin operation failed error
 */
export function createAdminOperationFailedError(message = 'Admin operation failed', details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.OPERATION_FAILED,
    message,
    500,
    details
  );
}

/**
 * Create a user not found error
 */
export function createUserNotFoundError(userId?: string) {
  const message = userId
    ? `User with ID ${userId} not found`
    : 'User not found';

  return new ApiError(
    ERROR_CODES.NOT_FOUND,
    message,
    404
  );
}

/**
 * Create an audit log retrieval error
 */
export function createAuditLogRetrievalError(message = 'Failed to retrieve audit logs', details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.RETRIEVAL_FAILED,
    message,
    500,
    details
  );
}

/**
 * Map admin service errors to API errors
 */
export function mapAdminServiceError(error: Error): ApiError {
  // Check for specific error types based on message
  const message = error.message.toLowerCase();

  if (message.includes('user not found') || message.includes('user does not exist')) {
    return createUserNotFoundError();
  }

  if (message.includes('audit log') || message.includes('audit trail')) {
    return createAuditLogRetrievalError();
  }

  // Default to a server error if no specific mapping is found
  return new ApiError(
    ERROR_CODES.INTERNAL_ERROR,
    'An unexpected admin operation error occurred',
    500
  );
}
