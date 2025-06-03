import {
  ERROR_CODE_DESCRIPTIONS,
  ErrorCode,
  SERVER_ERROR,
  EXPORT_ERROR,
} from "./error-codes";

/**
 * Error utilities used by the core and service layers.
 *
 * The classes in this file implement a simple hierarchy where every error has
 * a stable `code` and `httpStatus`.  Services should throw these errors so that
 * API handlers and logging utilities can treat them uniformly.
 */

/**
 * Base application error used across the core layer.
 *
 * @example
 * ```ts
 * throw new ApplicationError(SERVER_ERROR.SERVER_001, 'Unexpected failure');
 * ```
 */
export class ApplicationError extends Error {
  code: ErrorCode;
  details?: Record<string, any>;
  httpStatus: number;
  timestamp: string;
  private cachedString?: string;

  constructor(
    /** unique error code */
    code: ErrorCode,
    /** human readable message */
    message: string,
    /** HTTP status associated with this error */
    httpStatus = 500,
    /** optional structured details */
    details?: Record<string, any>,
  ) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
    this.details = details;
    this.httpStatus = httpStatus;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Serialize the error for transport or logging.
   */
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

  /** Cached JSON string representation */
  toJSONString() {
    if (!this.cachedString) {
      this.cachedString = JSON.stringify(this.toJSON());
    }
    return this.cachedString;
  }

  /**
   * Recreate an {@link ApplicationError} from serialized JSON.
   */
  static fromJSON(json: string | ReturnType<ApplicationError["toJSON"]>) {
    const obj = typeof json === "string" ? (JSON.parse(json) as any) : json;
    const err = new ApplicationError(
      obj.code as ErrorCode,
      obj.message,
      obj.httpStatus,
      obj.details,
    );
    err.timestamp = obj.timestamp;
    return err;
  }
}

/** Error thrown when validation fails. */
export class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_001, message, 400, details);
    this.name = "ValidationError";
  }
}

/** Error thrown when authentication fails. */
export class AuthenticationError extends ApplicationError {
  constructor(code: ErrorCode, message: string, details?: Record<string, any>) {
    super(code, message, 401, details);
    this.name = "AuthenticationError";
  }
}

/** Error thrown when the user lacks authorization to perform an action. */
export class AuthorizationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_004, message, 403, details);
    this.name = "AuthorizationError";
  }
}

/** Error thrown when a requested resource cannot be located. */
export class ResourceNotFoundError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_001, message, 404, details);
    this.name = "ResourceNotFoundError";
  }
}

/** Error thrown when a resource conflict occurs. */
export class ConflictError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_004, message, 409, details);
    this.name = "ConflictError";
  }
}

/** Error thrown when a client exceeds rate limits. */
export class RateLimitError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_005, message, 429, details);
    this.name = "RateLimitError";
  }
}

/** Generic error for service failures. */
export class ServiceError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_001, message, 500, details);
    this.name = "ServiceError";
  }
}

/** Error thrown when a database operation fails. */
export class DatabaseError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_002, message, 500, details);
    this.name = "DatabaseError";
  }
}

/** Error thrown when an external service returns a failure. */
export class ExternalServiceError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(SERVER_ERROR.SERVER_003, message, 502, details);
    this.name = "ExternalServiceError";
  }
}

/** Error thrown when a data export operation fails. */
export class DataExportError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(EXPORT_ERROR.EXPORT_001, message, 500, details);
    this.name = "DataExportError";
  }
}

// Type guards
export function isApplicationError(value: unknown): value is ApplicationError {
  return value instanceof ApplicationError;
}

export function isValidationError(value: unknown): value is ValidationError {
  return value instanceof ValidationError;
}

export function isAuthenticationError(
  value: unknown,
): value is AuthenticationError {
  return value instanceof AuthenticationError;
}

export function isAuthorizationError(
  value: unknown,
): value is AuthorizationError {
  return value instanceof AuthorizationError;
}

export function isResourceNotFoundError(
  value: unknown,
): value is ResourceNotFoundError {
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

export function isExternalServiceError(
  value: unknown,
): value is ExternalServiceError {
  return value instanceof ExternalServiceError;
}

export function isDataExportError(value: unknown): value is DataExportError {
  return value instanceof DataExportError;
}

// Utility functions

/**
 * Convert an unknown error value to an {@link ApplicationError} instance.
 */
export function createErrorFromUnknown(error: unknown): ApplicationError {
  if (isApplicationError(error)) {
    return error;
  }
  if (error instanceof Error) {
    return new ServiceError(error.message);
  }
  return new ServiceError("Unknown error");
}

/** Serialize an {@link ApplicationError} to a JSON string. */
export function serializeError(error: ApplicationError): string {
  return error.toJSONString();
}

/** Deserialize an {@link ApplicationError} from JSON. */
export function deserializeError(json: string): ApplicationError {
  return ApplicationError.fromJSON(json);
}

// Legacy type for backward compatibility
export type DataProviderError = ApplicationError;
export const isDataProviderError = isApplicationError;

// createError function for service compatibility
/**
 * Helper to build a populated {@link ApplicationError}.
 */
export function createError(
  code: ErrorCode,
  message: string,
  details?: Record<string, any>,
  cause?: unknown,
  httpStatus?: number,
): ApplicationError {
  const err = new ApplicationError(code, message, httpStatus || 500, details);
  if (cause instanceof Error && cause.stack) {
    err.stack = `${err.stack}\nCaused by: ${cause.stack}`;
  }
  return err;
}
