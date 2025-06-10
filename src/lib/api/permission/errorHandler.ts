/**
 * Permission Domain Error Handler
 * 
 * Specialized error handling for the permission domain.
 * This module provides error handling specific to permission management.
 */

import { NextResponse } from 'next/server';
import { ApiError, ERROR_CODES } from '@/lib/api/common';

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
 * Create a permission denied error
 */
export function createPermissionDeniedError(permission: string, resource?: string) {
  const message = resource
    ? `You don't have ${permission} permission for this ${resource}`
    : `You don't have ${permission} permission`;

  return new ApiError(
    ERROR_CODES.FORBIDDEN,
    message,
    403
  );
}

/**
 * Create a role not found error
 */
export function createRoleNotFoundError(roleId?: string) {
  const message = roleId ? `Role with ID ${roleId} not found` : 'Role not found';
  return new ApiError(ERROR_CODES.NOT_FOUND, message, 404);
}

/**
 * Create a role already exists error
 */
export function createRoleAlreadyExistsError(name: string) {
  return new ApiError(
    ERROR_CODES.ALREADY_EXISTS,
    `Role with name "${name}" already exists`,
    409
  );
}

export function createRoleUpdateFailedError(message = 'Failed to update role', details?: Record<string, any>) {
  return new ApiError(ERROR_CODES.UPDATE_FAILED, message, 500, details);
}

export function createRoleDeleteFailedError(message = 'Failed to delete role', details?: Record<string, any>) {
  return new ApiError(ERROR_CODES.DELETE_FAILED, message, 500, details);
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
    if (message.includes('role')) {
      return createRoleUpdateFailedError();
    }
    return createPermissionUpdateFailedError();
  }

  if (message.includes('delete failed') || message.includes('could not delete')) {
    if (message.includes('role')) {
      return createRoleDeleteFailedError();
    }
    return createPermissionDeleteFailedError();
  }

  if (message.includes('role not found') || message.includes('role does not exist')) {
    return createRoleNotFoundError();
  }

  if (message.includes('role already exists') || message.includes('duplicate role')) {
    const nameMatch = message.match(/"([^"]+)"/);
    const name = nameMatch ? nameMatch[1] : 'provided name';
    return createRoleAlreadyExistsError(name);
  }
  
  // Default to a server error if no specific mapping is found
  return new ApiError(
    ERROR_CODES.INTERNAL_ERROR,
    'An unexpected permission management error occurred',
    500
  );
}

/**
 * Handle permission errors consistently across the app
 */
export function handlePermissionError(error: any) {
  if (error instanceof ApiError && error.code === ERROR_CODES.FORBIDDEN) {
    console.warn(`Permission denied: ${error.message}`);
    return NextResponse.json(
      {
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: error.message,
        },
      },
      { status: 403 }
    );
  }

  throw error;
}
