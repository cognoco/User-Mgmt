import { NextResponse } from 'next/server';
import { ApiError, ERROR_CODES } from '@/lib/api/common';
import { logUserAction } from '@/lib/audit/auditLogger';

export type AuthErrorType =
  | 'MISSING_TOKEN'
  | 'MALFORMED_TOKEN'
  | 'INVALID_TOKEN'
  | 'EXPIRED_TOKEN'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'ACCOUNT_SUSPENDED'
  | 'RATE_LIMITED'
  | 'MFA_REQUIRED';

interface AuthErrorSpec {
  code: string;
  message: string;
  status: number;
}

const AUTH_ERROR_MAP: Record<AuthErrorType, AuthErrorSpec> = {
  MISSING_TOKEN: {
    code: ERROR_CODES.UNAUTHORIZED,
    message: 'Authentication required',
    status: 401,
  },
  MALFORMED_TOKEN: {
    code: ERROR_CODES.UNAUTHORIZED,
    message: 'Malformed authentication token',
    status: 401,
  },
  INVALID_TOKEN: {
    code: ERROR_CODES.UNAUTHORIZED,
    message: 'Invalid authentication token',
    status: 401,
  },
  EXPIRED_TOKEN: {
    code: ERROR_CODES.SESSION_EXPIRED,
    message: 'Authentication token expired',
    status: 401,
  },
  INSUFFICIENT_PERMISSIONS: {
    code: ERROR_CODES.FORBIDDEN,
    message: 'Insufficient permissions',
    status: 403,
  },
  ACCOUNT_SUSPENDED: {
    code: ERROR_CODES.ACCOUNT_LOCKED,
    message: 'Account suspended',
    status: 403,
  },
  RATE_LIMITED: {
    code: ERROR_CODES.OPERATION_FAILED,
    message: 'Too many authentication attempts, please try again later.',
    status: 429,
  },
  MFA_REQUIRED: {
    code: ERROR_CODES.MFA_REQUIRED,
    message: 'Multi-factor authentication required',
    status: 403,
  },
};

export function createAuthApiError(
  type: AuthErrorType,
  details?: Record<string, any>
): ApiError {
  const spec = AUTH_ERROR_MAP[type];
  logUserAction({
    action: 'AUTH_FAILURE',
    status: 'FAILURE',
    targetResourceType: 'auth',
    details: { type, ...(details || {}) },
  }).catch((e) => console.error('Failed to log auth error:', e));
  return new ApiError(spec.code as any, spec.message, spec.status, details);
}

export function createAuthError(
  type: AuthErrorType,
  details?: Record<string, any>
): NextResponse {
  const error = createAuthApiError(type, details);
  return NextResponse.json(error.toResponse(), { status: error.status });
}

export { AUTH_ERROR_MAP };
