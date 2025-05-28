import { ApiError, ERROR_STATUS_MAP, ERROR_CODES, ErrorCode } from './common';

/**
 * Normalize unknown errors into ApiError instances.
 */
export function toApiError(err: unknown, fallbackCode: ErrorCode = ERROR_CODES.INTERNAL_ERROR) {
  if (err instanceof ApiError) return err;
  const message = err instanceof Error ? err.message : 'Unexpected error';
  const status = ERROR_STATUS_MAP[fallbackCode] ?? 500;
  return new ApiError(fallbackCode, message, status);
}

/**
 * Utility to map a list of known Error instances to ApiErrors.
 */
export type ErrorMap = [RegExp, () => ApiError][];
export function mapError(err: unknown, mappings: ErrorMap, fallbackCode: ErrorCode = ERROR_CODES.INTERNAL_ERROR) {
  const msg = err instanceof Error ? err.message : String(err);
  for (const [pattern, factory] of mappings) {
    if (pattern.test(msg)) {
      return factory();
    }
  }
  return toApiError(err, fallbackCode);
}
