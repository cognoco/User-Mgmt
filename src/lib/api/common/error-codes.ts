/**
 * API Error Codes
 * 
 * Standardized error codes for API responses across all domains.
 * These codes help clients identify specific error conditions and handle them appropriately.
 */

// Auth domain error codes
export const AUTH_ERROR_CODES = {
  UNAUTHORIZED: 'auth/unauthorized',
  FORBIDDEN: 'auth/forbidden',
  INVALID_CREDENTIALS: 'auth/invalid_credentials',
  EMAIL_NOT_VERIFIED: 'auth/email_not_verified',
  MFA_REQUIRED: 'auth/mfa_required',
  ACCOUNT_LOCKED: 'auth/account_locked',
  PASSWORD_EXPIRED: 'auth/password_expired',
  SESSION_EXPIRED: 'auth/session_expired',
} as const;

// User domain error codes
export const USER_ERROR_CODES = {
  NOT_FOUND: 'user/not_found',
  ALREADY_EXISTS: 'user/already_exists',
  INVALID_DATA: 'user/invalid_data',
  UPDATE_FAILED: 'user/update_failed',
  DELETE_FAILED: 'user/delete_failed',
} as const;

// Team domain error codes
export const TEAM_ERROR_CODES = {
  NOT_FOUND: 'team/not_found',
  ALREADY_EXISTS: 'team/already_exists',
  INVALID_DATA: 'team/invalid_data',
  UPDATE_FAILED: 'team/update_failed',
  DELETE_FAILED: 'team/delete_failed',
  MEMBER_NOT_FOUND: 'team/member_not_found',
  MEMBER_ALREADY_EXISTS: 'team/member_already_exists',
} as const;

// Permission domain error codes
export const PERMISSION_ERROR_CODES = {
  NOT_FOUND: 'permission/not_found',
  ALREADY_EXISTS: 'permission/already_exists',
  INVALID_DATA: 'permission/invalid_data',
  UPDATE_FAILED: 'permission/update_failed',
  DELETE_FAILED: 'permission/delete_failed',
  ASSIGNMENT_FAILED: 'permission/assignment_failed',
} as const;

// Validation error codes
export const VALIDATION_ERROR_CODES = {
  INVALID_REQUEST: 'validation/error',
  MISSING_REQUIRED_FIELD: 'validation/missing_field',
  INVALID_FORMAT: 'validation/invalid_format',
} as const;

// Server error codes
export const SERVER_ERROR_CODES = {
  INTERNAL_ERROR: 'server/internal_error',
  SERVICE_UNAVAILABLE: 'server/service_unavailable',
  DATABASE_ERROR: 'server/database_error',
  OPERATION_FAILED: 'server/operation_failed',
  RETRIEVAL_FAILED: 'server/retrieval_failed',
} as const;

// Combine all error codes for easy export
export const ERROR_CODES = {
  ...AUTH_ERROR_CODES,
  ...USER_ERROR_CODES,
  ...TEAM_ERROR_CODES,
  ...PERMISSION_ERROR_CODES,
  ...VALIDATION_ERROR_CODES,
  ...SERVER_ERROR_CODES,
} as const;

// Type for all error codes
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
