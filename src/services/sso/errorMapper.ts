import { createError, ApplicationError, isApplicationError } from '@/core/common/errors';
import { SSO_ERROR } from '@/core/common/errorCodes';

export type SsoAuthStage = 'configuration' | 'discovery' | 'authentication' | 'federation' | 'token';

/**
 * Translate provider specific errors into ApplicationError instances.
 */
export function translateSsoError(stage: SsoAuthStage, err: unknown): ApplicationError {
  if (isApplicationError(err)) {
    return err;
  }

  const message = err instanceof Error ? err.message : 'SSO error';

  const code =
    stage === 'configuration'
      ? SSO_ERROR.SSO_002
      : stage === 'federation'
      ? SSO_ERROR.SSO_003
      : stage === 'authentication'
      ? SSO_ERROR.SSO_004
      : SSO_ERROR.SSO_001;

  return createError(code, message, { stage }, err);
}
