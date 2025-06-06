import { describe, it, expect } from 'vitest';
import {
  createPaymentFailedError,
  createBillingProviderError,
  createBillingPermissionError,
  createStateMismatchError,
} from '../api-error';
import { ERROR_CODES } from '../error-codes';

describe('billing error helpers', () => {
  it('creates payment failed error', () => {
    const err = createPaymentFailedError('card declined');
    expect(err.code).toBe(ERROR_CODES.PAYMENT_FAILED);
    expect(err.status).toBe(402);
    expect(err.category).toBe('billing');
  });

  it('creates provider error', () => {
    const err = createBillingProviderError('down');
    expect(err.code).toBe(ERROR_CODES.PROVIDER_ERROR);
    expect(err.category).toBe('billing');
  });

  it('creates permission error', () => {
    const err = createBillingPermissionError();
    expect(err.code).toBe(ERROR_CODES.PERMISSION_DENIED);
  });

  it('creates state mismatch error', () => {
    const err = createStateMismatchError('bad');
    expect(err.code).toBe(ERROR_CODES.STATE_MISMATCH);
  });
});
