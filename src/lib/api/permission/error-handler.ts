/**
 * Permission Domain Error Handler
 * 
 * Specialized error handling for the permission domain.
 * This module provides error handling specific to permission management.
 */

import { ApiError, ERROR_CODES } from '../common';

/**
 * Create a permission not found error
 */
export function createPermissionNotFoundError(permissionId?: string) {
  const message = permissionId
    ? `Permission with ID ${permissionId} not found`
    : 'Permission not found';
  
  return new ApiError(
    ERROR_CODES.NOT_FOUND,
    message,
    404
  );
}

/**
 * Create a permission already exists error
 */
export function createPermissionAlreadyExistsError(name: string) {
  return new ApiError(
    ERROR_CODES.ALREADY_EXISTS,
    `Permission with name "${name}" already exists`,
    409
  );
}

/**
 * Create a permission assignment failed error
 */
export function createPermissionAssignmentFailedError(message = 'Failed to assign permission', details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.ASSIGNMENT_FAILED,
    message,
    500,
    details
  );
}

/**
 * Create a permission update failed error
 */
export function createPermissionUpdateFailedError(message = 'Failed to update permission', details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.UPDATE_FAILED,
    message,
    500,
    details
  );
}

/**
 * Create a permission delete failed error
 */
export function createPermissionDeleteFailedError(message = 'Failed to delete permission', details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.DELETE_FAILED,
    message,
    500,
    details
  );
}

/**
 * Map permission service errors to API errors
 * 
 * This function maps errors from the permission service to standardized API errors.
 * It handles common error cases from the permission service and converts them to
 * the appropriate API error with the correct status code.
 */
export function mapPermissionServiceError(error: Error): ApiError {
  // Check for specific error types based on message or error code
  const message = error.message.toLowerCase();
  
  if (message.includes('permission not found') || message.includes('permission does not exist')) {
    return createPermissionNotFoundError();
  }
  
  if (message.includes('permission already exists') || message.includes('duplicate permission')) {
    // Try to extract permission name from error message
    const nameMatch = message.match(/"([^"]+)"/);
    const name = nameMatch ? nameMatch[1] : 'provided name';
    
    return createPermissionAlreadyExistsError(name);
  }
  
  if (message.includes('assignment failed') || message.includes('could not assign')) {
    return createPermissionAssignmentFailedError();
  }
  
  if (message.includes('update failed') || message.includes('could not update')) {
    return createPermissionUpdateFailedError();
  }
  
  if (message.includes('delete failed') || message.includes('could not delete')) {
    return createPermissionDeleteFailedError();
  }
  
  // Default to a server error if no specific mapping is found
  return new ApiError(
    ERROR_CODES.INTERNAL_ERROR,
    'An unexpected permission management error occurred',
    500
  );
}
