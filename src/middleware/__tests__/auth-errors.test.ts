import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthError, createAuthApiError } from '../auth-errors';
import { ERROR_CODES } from '@/lib/api/common';

vi.mock('@/lib/audit/auditLogger', () => ({
  logUserAction: vi.fn().mockResolvedValue(undefined)
}));

import { logUserAction } from '@/lib/audit/auditLogger';

describe('auth-errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates error response and logs event', async () => {
    const res = createAuthError('INVALID_TOKEN');
    expect(res.status).toBe(401);
    expect(res.headers.get('content-type')).toBe('application/json');
    const body = await res.json();
    expect(body.error.code).toBe(ERROR_CODES.UNAUTHORIZED);
    expect(body.error.message).toBe('Invalid authentication token');
    expect(logUserAction).toHaveBeenCalledWith(expect.objectContaining({
      action: 'AUTH_FAILURE',
      status: 'FAILURE',
      details: { type: 'INVALID_TOKEN' }
    }));
  });

  it('creates ApiError with details', () => {
    const err = createAuthApiError('INSUFFICIENT_PERMISSIONS', { foo: 'bar' });
    expect(err.code).toBe(ERROR_CODES.FORBIDDEN);
    expect(err.status).toBe(403);
    expect(err.details).toEqual({ foo: 'bar' });
  });
});
