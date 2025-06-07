/**
 * User Domain Error Handler
 * 
 * Specialized error handling for the user domain.
 * This module provides error handling specific to user management.
 */

import { ApiError, ERROR_CODES } from '@/src/lib/api/common'168;

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
 * Create a user already exists error
 */
export function createUserAlreadyExistsError(email: string) {
  return new ApiError(
    ERROR_CODES.ALREADY_EXISTS,
    `User with email ${email} already exists`,
    409
  );
}

/**
 * Create a user update failed error
 */
export function createUserUpdateFailedError(message = 'Failed to update user', details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.UPDATE_FAILED,
    message,
    500,
    details
  );
}

/**
 * Create a user delete failed error
 */
export function createUserDeleteFailedError(message = 'Failed to delete user', details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.DELETE_FAILED,
    message,
    500,
    details
  );
}

/**
 * Map user service errors to API errors
 * 
 * This function maps errors from the user service to standardized API errors.
 * It handles common error cases from the user service and converts them to
 * the appropriate API error with the correct status code.
 */
export function mapUserServiceError(error: Error): ApiError {
  // Check for specific error types based on message or error code
  const message = error.message.toLowerCase();
  
  if (message.includes('not found') || message.includes('does not exist')) {
    return createUserNotFoundError();
  }
  
  if (message.includes('already exists') || message.includes('duplicate')) {
    // Try to extract email from error message
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : 'provided email';
    
    return createUserAlreadyExistsError(email);
  }
  
  if (message.includes('update failed') || message.includes('could not update')) {
    return createUserUpdateFailedError();
  }
  
  if (message.includes('delete failed') || message.includes('could not delete')) {
    return createUserDeleteFailedError();
  }
  
  // Default to a server error if no specific mapping is found
  return new ApiError(
    ERROR_CODES.INTERNAL_ERROR,
    'An unexpected user management error occurred',
    500
  );
}
