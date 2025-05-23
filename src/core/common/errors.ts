import type { ErrorCode } from '@/lib/api/common/error-codes';

/**
 * Generic error information returned by data provider operations.
 */
export interface DataProviderError {
  /** Stable error code for programmatic handling */
  code: ErrorCode;
  /** Human friendly description of the error */
  message: string;
  /** Optional additional details useful for debugging */
  details?: Record<string, any>;
}

/**
 * Type guard to check if a value is a {@link DataProviderError}.
 */
export function isDataProviderError(value: unknown): value is DataProviderError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof (value as any).code === 'string' &&
    'message' in value &&
    typeof (value as any).message === 'string'
  );
}
