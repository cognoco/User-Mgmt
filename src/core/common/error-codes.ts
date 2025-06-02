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
  | SERVER_ERROR;

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
};

