import { ApplicationError, createError } from '@/lib/utils/error-factory';
import { SSO_ERROR } from '@/core/common/error-codes';

/**
 * Translate provider-specific errors into application errors.
 */
export function mapSsoProviderError(err: unknown): ApplicationError {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('access_denied') || msg.includes('denied')) {
      return createError(
        SSO_ERROR.SSO_002,
        'Authorization denied by provider',
        undefined,
        err,
        400,
      );
    }
    if (msg.includes('config')) {
      return createError(
        SSO_ERROR.SSO_003,
        'Invalid SSO configuration',
        undefined,
        err,
        400,
      );
    }
    if (msg.includes('federation')) {
      return createError(
        SSO_ERROR.SSO_004,
        'Federation failed',
        undefined,
        err,
        500,
      );
    }
    if (msg.includes('network')) {
      return createError(
        SSO_ERROR.SSO_005,
        'Network error while contacting provider',
        undefined,
        err,
        502,
      );
    }
    return createError(SSO_ERROR.SSO_001, err.message, undefined, err, 500);
  }

  return createError(SSO_ERROR.SSO_001, 'SSO error', undefined, err as any, 500);
}
