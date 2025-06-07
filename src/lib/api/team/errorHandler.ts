/**
 * Team Domain Error Handler
 * 
 * Specialized error handling for the team domain.
 * This module provides error handling specific to team management.
 */

import { ApiError, ERROR_CODES } from '@/src/lib/api/common'168;

/**
 * Create a team not found error
 */
export function createTeamNotFoundError(teamId?: string) {
  const message = teamId
    ? `Team with ID ${teamId} not found`
    : 'Team not found';
  
  return new ApiError(
    ERROR_CODES.NOT_FOUND,
    message,
    404
  );
}

/**
 * Create a team already exists error
 */
export function createTeamAlreadyExistsError(name: string) {
  return new ApiError(
    ERROR_CODES.ALREADY_EXISTS,
    `Team with name "${name}" already exists`,
    409
  );
}

/**
 * Create a team member not found error
 */
export function createTeamMemberNotFoundError(teamId?: string, userId?: string) {
  let message = 'Team member not found';
  
  if (teamId && userId) {
    message = `User ${userId} is not a member of team ${teamId}`;
  } else if (teamId) {
    message = `Member not found in team ${teamId}`;
  } else if (userId) {
    message = `User ${userId} is not a member of the specified team`;
  }
  
  return new ApiError(
    ERROR_CODES.MEMBER_NOT_FOUND,
    message,
    404
  );
}

/**
 * Create a team member already exists error
 */
export function createTeamMemberAlreadyExistsError(teamId?: string, userId?: string) {
  let message = 'User is already a member of this team';
  
  if (teamId && userId) {
    message = `User ${userId} is already a member of team ${teamId}`;
  }
  
  return new ApiError(
    ERROR_CODES.MEMBER_ALREADY_EXISTS,
    message,
    409
  );
}

/**
 * Create a team update failed error
 */
export function createTeamUpdateFailedError(message = 'Failed to update team', details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.UPDATE_FAILED,
    message,
    500,
    details
  );
}

/**
 * Create a team delete failed error
 */
export function createTeamDeleteFailedError(message = 'Failed to delete team', details?: Record<string, any>) {
  return new ApiError(
    ERROR_CODES.DELETE_FAILED,
    message,
    500,
    details
  );
}

/**
 * Map team service errors to API errors
 * 
 * This function maps errors from the team service to standardized API errors.
 * It handles common error cases from the team service and converts them to
 * the appropriate API error with the correct status code.
 */
export function mapTeamServiceError(error: Error): ApiError {
  // Check for specific error types based on message or error code
  const message = error.message.toLowerCase();
  
  if (message.includes('team not found') || message.includes('team does not exist')) {
    return createTeamNotFoundError();
  }
  
  if (message.includes('team already exists') || message.includes('duplicate team')) {
    // Try to extract team name from error message
    const nameMatch = message.match(/"([^"]+)"/);
    const name = nameMatch ? nameMatch[1] : 'provided name';
    
    return createTeamAlreadyExistsError(name);
  }
  
  if (message.includes('member not found') || message.includes('not a member')) {
    return createTeamMemberNotFoundError();
  }
  
  if (message.includes('already a member') || message.includes('duplicate member')) {
    return createTeamMemberAlreadyExistsError();
  }
  
  if (message.includes('update failed') || message.includes('could not update')) {
    return createTeamUpdateFailedError();
  }
  
  if (message.includes('delete failed') || message.includes('could not delete')) {
    return createTeamDeleteFailedError();
  }
  
  // Default to a server error if no specific mapping is found
  return new ApiError(
    ERROR_CODES.INTERNAL_ERROR,
    'An unexpected team management error occurred',
    500
  );
}
