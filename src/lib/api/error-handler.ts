/**
 * Maps API error codes to HTTP status codes and broad categories.
 */
export type ErrorCategory = 'auth' | 'validation' | 'business' | 'permission' | 'server';

export interface ErrorMapEntry {
  status: number;
  category: ErrorCategory;
}

export const ERROR_MAP: Record<string, ErrorMapEntry> = {
  // Auth errors
  'auth/unauthorized': { status: 401, category: 'auth' },
  'auth/forbidden': { status: 403, category: 'auth' },
  'auth/invalid_credentials': { status: 401, category: 'auth' },
  'auth/email_not_verified': { status: 403, category: 'auth' },
  'auth/mfa_required': { status: 403, category: 'auth' },
  'auth/account_locked': { status: 403, category: 'auth' },
  'auth/password_expired': { status: 403, category: 'auth' },
  'auth/session_expired': { status: 401, category: 'auth' },

  // User errors
  'user/not_found': { status: 404, category: 'business' },
  'user/already_exists': { status: 409, category: 'business' },
  'user/invalid_data': { status: 400, category: 'business' },
  'user/update_failed': { status: 500, category: 'business' },
  'user/delete_failed': { status: 500, category: 'business' },

  // Team errors
  'team/not_found': { status: 404, category: 'business' },
  'team/already_exists': { status: 409, category: 'business' },
  'team/invalid_data': { status: 400, category: 'business' },
  'team/update_failed': { status: 500, category: 'business' },
  'team/delete_failed': { status: 500, category: 'business' },
  'team/member_not_found': { status: 404, category: 'business' },
  'team/member_already_exists': { status: 409, category: 'business' },

  // Permission errors
  'permission/not_found': { status: 404, category: 'permission' },
  'permission/already_exists': { status: 409, category: 'permission' },
  'permission/invalid_data': { status: 400, category: 'permission' },
  'permission/update_failed': { status: 500, category: 'permission' },
  'permission/delete_failed': { status: 500, category: 'permission' },
  'permission/assignment_failed': { status: 500, category: 'permission' },

  // Validation errors
  'validation/error': { status: 400, category: 'validation' },
  'validation/missing_field': { status: 400, category: 'validation' },
  'validation/invalid_format': { status: 400, category: 'validation' },

  // Server errors
  'server/internal_error': { status: 500, category: 'server' },
  'server/service_unavailable': { status: 503, category: 'server' },
  'server/database_error': { status: 500, category: 'server' },
  'server/operation_failed': { status: 500, category: 'server' },
  'server/retrieval_failed': { status: 500, category: 'server' },
};

/**
 * Return the HTTP status for a given error code.
 */
export function getErrorStatus(code: string): number {
  return ERROR_MAP[code]?.status ?? 500;
}

/**
 * Return the broad error category for a given code.
 */
export function getErrorCategory(code: string): ErrorCategory {
  return ERROR_MAP[code]?.category ?? 'server';
}
