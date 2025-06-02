import { ERROR_CODE_DESCRIPTIONS, ErrorCode, SERVER_ERROR } from './error-codes';

/**
 * Base application error used across the core layer.
 */
export class ApplicationError extends Error {
  code: ErrorCode;
  details?: Record<string, any>;
  httpStatus: number;
  timestamp: string;

  constructor(
    code: ErrorCode,
    message: string,
    httpStatus = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.details = details;
    this.httpStatus = httpStatus;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      httpStatus: this.httpStatus,
      timestamp: this.timestamp,
      ...(this.details && { details: this.details }),
    };
  }

  static fromJSON(json: string | ReturnType<ApplicationError['toJSON']>) {
    const obj = typeof json === 'string' ? (JSON.parse(json) as any) : json;
    const err = new ApplicationError(
      obj.code as ErrorCode,
      obj.message,
      obj.httpStatus,
      obj.details
    );
    err.timestamp = obj.timestamp;
    return err;
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_001, message, 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(code: ErrorCode, message: string, details?: Record<string, any>) {
    super(code, message, 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_004, message, 403, details);
    this.name = 'AuthorizationError';
  }
}

export class ResourceNotFoundError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_001, message, 404, details);
    this.name = 'ResourceNotFoundError';
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_004, message, 409, details);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_005, message, 429, details);
    this.name = 'RateLimitError';
  }
}

export class ServiceError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_001, message, 500, details);
    this.name = 'ServiceError';
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_002, message, 500, details);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_003, message, 502, details);
    this.name = 'ExternalServiceError';
  }
}

// Type guards
export function isApplicationError(value: unknown): value is ApplicationError {
  return value instanceof ApplicationError;
}

export function isValidationError(value: unknown): value is ValidationError {
  return value instanceof ValidationError;
}

export function isAuthenticationError(value: unknown): value is AuthenticationError {
  return value instanceof AuthenticationError;
}

export function isAuthorizationError(value: unknown): value is AuthorizationError {
  return value instanceof AuthorizationError;
}

export function isResourceNotFoundError(value: unknown): value is ResourceNotFoundError {
  return value instanceof ResourceNotFoundError;
}

export function isConflictError(value: unknown): value is ConflictError {
  return value instanceof ConflictError;
}

export function isRateLimitError(value: unknown): value is RateLimitError {
  return value instanceof RateLimitError;
}

export function isServiceError(value: unknown): value is ServiceError {
  return value instanceof ServiceError;
}

export function isDatabaseError(value: unknown): value is DatabaseError {
  return value instanceof DatabaseError;
}

export function isExternalServiceError(value: unknown): value is ExternalServiceError {
  return value instanceof ExternalServiceError;
}

// Utility functions
export function createErrorFromUnknown(error: unknown): ApplicationError {
  if (isApplicationError(error)) {
    return error;
  }
  if (error instanceof Error) {
    return new ServiceError(error.message);
  }
  return new ServiceError('Unknown error');
}

export function serializeError(error: ApplicationError): string {
  return JSON.stringify(error.toJSON());
}

export function deserializeError(json: string): ApplicationError {
  return ApplicationError.fromJSON(json);
}

// Legacy type for backward compatibility
export type DataProviderError = ApplicationError;
export const isDataProviderError = isApplicationError;

