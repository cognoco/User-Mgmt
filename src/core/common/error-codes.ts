// Central error code definitions for the core layer
// Organized by domain to keep codes unique and descriptive.

export enum AUTH_ERROR {
  /** Generic authentication failure */
  AUTH_001 = 'AUTH_001',
  /** Invalid credentials provided */
  AUTH_002 = 'AUTH_002',
  /** Session has expired */
  AUTH_003 = 'AUTH_003',
  /** Multi factor authentication required */
  AUTH_004 = 'AUTH_004',
}

export enum USER_ERROR {
  /** User not found */
  USER_001 = 'USER_001',
  /** User already exists */
  USER_002 = 'USER_002',
  /** Invalid user data */
  USER_003 = 'USER_003',
}

export enum TEAM_ERROR {
  /** Team not found */
  TEAM_001 = 'TEAM_001',
  /** User is already a team member */
  TEAM_002 = 'TEAM_002',
  /** Invalid team data */
  TEAM_003 = 'TEAM_003',
}

export enum WEBHOOK_ERROR {
  /** Invalid webhook payload */
  WEBHOOK_001 = 'WEBHOOK_001',
  /** Signature validation failed */
  WEBHOOK_002 = 'WEBHOOK_002',
  /** Delivery failed after retries */
  WEBHOOK_003 = 'WEBHOOK_003',
}

export enum SERVER_ERROR {
  /** Generic server error */
  SERVER_001 = 'SERVER_001',
  /** Database operation failed */
  SERVER_002 = 'SERVER_002',
  /** External service failure */
  SERVER_003 = 'SERVER_003',
  /** Operation conflicted with existing resource */
  SERVER_004 = 'SERVER_004',
  /** Rate limit exceeded */
  SERVER_005 = 'SERVER_005',
}

export type ErrorCode =
  | AUTH_ERROR
  | USER_ERROR
  | TEAM_ERROR
  | SERVER_ERROR
  | WEBHOOK_ERROR;

// Unified ERROR_CODES object for backward compatibility
export const ERROR_CODES = {
  // Auth codes
  AUTHENTICATION_FAILED: AUTH_ERROR.AUTH_001,
  INVALID_CREDENTIALS: AUTH_ERROR.AUTH_002,
  SESSION_EXPIRED: AUTH_ERROR.AUTH_003,
  MFA_REQUIRED: AUTH_ERROR.AUTH_004,
  
  // User codes
  USER_NOT_FOUND: USER_ERROR.USER_001,
  USER_ALREADY_EXISTS: USER_ERROR.USER_002,
  INVALID_USER_DATA: USER_ERROR.USER_003,
  
  // Team codes
  TEAM_NOT_FOUND: TEAM_ERROR.TEAM_001,
  MEMBER_ALREADY_EXISTS: TEAM_ERROR.TEAM_002,
  INVALID_TEAM_DATA: TEAM_ERROR.TEAM_003,
  
  // Server codes
  INTERNAL_ERROR: SERVER_ERROR.SERVER_001,
  DATABASE_ERROR: SERVER_ERROR.SERVER_002,
  EXTERNAL_SERVICE_ERROR: SERVER_ERROR.SERVER_003,
  CONFLICT_ERROR: SERVER_ERROR.SERVER_004,
  RATE_LIMIT_ERROR: SERVER_ERROR.SERVER_005,

  // Webhook codes
  WEBHOOK_INVALID_PAYLOAD: WEBHOOK_ERROR.WEBHOOK_001,
  WEBHOOK_SIGNATURE_INVALID: WEBHOOK_ERROR.WEBHOOK_002,
  WEBHOOK_DELIVERY_FAILED: WEBHOOK_ERROR.WEBHOOK_003,
} as const;

// Optional descriptions for mapping codes to human readable text
export const ERROR_CODE_DESCRIPTIONS: Record<ErrorCode, string> = {
  [AUTH_ERROR.AUTH_001]: 'Authentication failed',
  [AUTH_ERROR.AUTH_002]: 'Invalid credentials',
  [AUTH_ERROR.AUTH_003]: 'Session expired',
  [AUTH_ERROR.AUTH_004]: 'MFA required',
  [USER_ERROR.USER_001]: 'User not found',
  [USER_ERROR.USER_002]: 'User already exists',
  [USER_ERROR.USER_003]: 'Invalid user data',
  [TEAM_ERROR.TEAM_001]: 'Team not found',
  [TEAM_ERROR.TEAM_002]: 'Member already exists',
  [TEAM_ERROR.TEAM_003]: 'Invalid team data',
  [SERVER_ERROR.SERVER_001]: 'Internal server error',
  [SERVER_ERROR.SERVER_002]: 'Database error',
  [SERVER_ERROR.SERVER_003]: 'External service error',
  [SERVER_ERROR.SERVER_004]: 'Conflict',
  [SERVER_ERROR.SERVER_005]: 'Rate limit exceeded',
  [WEBHOOK_ERROR.WEBHOOK_001]: 'Invalid webhook payload',
  [WEBHOOK_ERROR.WEBHOOK_002]: 'Invalid webhook signature',
  [WEBHOOK_ERROR.WEBHOOK_003]: 'Webhook delivery failed',
};

