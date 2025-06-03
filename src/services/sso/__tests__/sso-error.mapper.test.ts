import { describe, it, expect } from 'vitest';
import { mapSsoProviderError } from '../sso-error.mapper';
import { SSO_ERROR } from '@/core/common/error-codes';

describe('mapSsoProviderError', () => {
  it('maps denied errors', () => {
    const err = new Error('access_denied');
    const appErr = mapSsoProviderError(err);
    expect(appErr.code).toBe(SSO_ERROR.SSO_002);
  });

  it('maps config errors', () => {
    const err = new Error('Configuration missing');
    const appErr = mapSsoProviderError(err);
    expect(appErr.code).toBe(SSO_ERROR.SSO_003);
  });

  it('maps network errors', () => {
    const err = new Error('Network timeout');
    const appErr = mapSsoProviderError(err);
    expect(appErr.code).toBe(SSO_ERROR.SSO_005);
  });
});
