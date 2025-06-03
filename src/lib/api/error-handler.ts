/**
 * Maps API error codes to HTTP status codes and broad categories.
 */
export type ErrorCategory = 'auth' | 'validation' | 'business' | 'permission' | 'server';

import {
  ERROR_STATUS_MAP,
  AUTH_ERROR_CODES,
  USER_ERROR_CODES,
  TEAM_ERROR_CODES,
  PERMISSION_ERROR_CODES,
  VALIDATION_ERROR_CODES,
  SERVER_ERROR_CODES,
  SSO_ERROR_CODES,
  type ErrorCode,
} from './common/error-codes';



const CATEGORY_MAP: Record<ErrorCode, ErrorCategory> = {
  // Auth
  [AUTH_ERROR_CODES.UNAUTHORIZED]: 'auth',
  [AUTH_ERROR_CODES.FORBIDDEN]: 'auth',
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'auth',
  [AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED]: 'auth',
  [AUTH_ERROR_CODES.MFA_REQUIRED]: 'auth',
  [AUTH_ERROR_CODES.ACCOUNT_LOCKED]: 'auth',
  [AUTH_ERROR_CODES.PASSWORD_EXPIRED]: 'auth',
  [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'auth',

  // User
  [USER_ERROR_CODES.NOT_FOUND]: 'business',
  [USER_ERROR_CODES.ALREADY_EXISTS]: 'business',
  [USER_ERROR_CODES.INVALID_DATA]: 'business',
  [USER_ERROR_CODES.UPDATE_FAILED]: 'business',
  [USER_ERROR_CODES.DELETE_FAILED]: 'business',

  // Team
  [TEAM_ERROR_CODES.NOT_FOUND]: 'business',
  [TEAM_ERROR_CODES.ALREADY_EXISTS]: 'business',
  [TEAM_ERROR_CODES.INVALID_DATA]: 'business',
  [TEAM_ERROR_CODES.UPDATE_FAILED]: 'business',
  [TEAM_ERROR_CODES.DELETE_FAILED]: 'business',
  [TEAM_ERROR_CODES.MEMBER_NOT_FOUND]: 'business',
  [TEAM_ERROR_CODES.MEMBER_ALREADY_EXISTS]: 'business',

  // Permission
  [PERMISSION_ERROR_CODES.NOT_FOUND]: 'permission',
  [PERMISSION_ERROR_CODES.ALREADY_EXISTS]: 'permission',
  [PERMISSION_ERROR_CODES.INVALID_DATA]: 'permission',
  [PERMISSION_ERROR_CODES.UPDATE_FAILED]: 'permission',
  [PERMISSION_ERROR_CODES.DELETE_FAILED]: 'permission',
  [PERMISSION_ERROR_CODES.ASSIGNMENT_FAILED]: 'permission',

  // Validation
  [VALIDATION_ERROR_CODES.INVALID_REQUEST]: 'validation',
  [VALIDATION_ERROR_CODES.MISSING_REQUIRED_FIELD]: 'validation',
  [VALIDATION_ERROR_CODES.INVALID_FORMAT]: 'validation',

  // SSO
  [SSO_ERROR_CODES.GENERIC_ERROR]: 'auth',
  [SSO_ERROR_CODES.PROVIDER_DENIED]: 'auth',
  [SSO_ERROR_CODES.INVALID_CONFIGURATION]: 'business',
  [SSO_ERROR_CODES.FEDERATION_FAILED]: 'auth',
  [SSO_ERROR_CODES.NETWORK_ERROR]: 'server',

  // Server
  [SERVER_ERROR_CODES.INTERNAL_ERROR]: 'server',
  [SERVER_ERROR_CODES.SERVICE_UNAVAILABLE]: 'server',
  [SERVER_ERROR_CODES.DATABASE_ERROR]: 'server',
  [SERVER_ERROR_CODES.OPERATION_FAILED]: 'server',
  [SERVER_ERROR_CODES.RETRIEVAL_FAILED]: 'server',
};

/**
 * Return the HTTP status for a given error code.
 */
export function getErrorStatus(code: string): number {
  return ERROR_STATUS_MAP[code as ErrorCode] ?? 500;
}

/**
 * Return the broad error category for a given code.
 */
export function getErrorCategory(code: string): ErrorCategory {
  return CATEGORY_MAP[code as ErrorCode] ?? 'server';
}
