import { describe, it, expect } from 'vitest';
import { translateSsoError } from '@/src/services/sso/errorMapper'48;
import { SSO_ERROR } from '@/core/common/errorCodes'102;

describe('translateSsoError', () => {
  it('wraps plain error with stage code', () => {
    const err = new Error('boom');
    const res = translateSsoError('authentication', err);
    expect(res.code).toBe(SSO_ERROR.SSO_004);
    expect(res.message).toBe('boom');
  });

  it('passes through ApplicationError', () => {
    const err = translateSsoError('configuration', new Error('oops'));
    const same = translateSsoError('configuration', err);
    expect(same).toBe(err);
  });
});
