import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers'64;
import { validateAuthToken } from '@/src/middleware/validateAuthToken'141;
import { getSessionFromToken } from '@/services/auth/factory';
import { extractAuthToken } from '@/lib/auth/utils';
import { AUTH_ERROR_MAP } from '@/src/middleware/authErrors'320;

vi.mock('@/services/auth/factory');
vi.mock('@/lib/auth/utils');

const reqUrl = 'http://localhost';

const mockUser = { id: 'user-1' } as any;

describe('validateAuthToken', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns success for valid token', async () => {
    const req = createAuthenticatedRequest('GET', reqUrl, undefined, 'valid-token');
    vi.mocked(extractAuthToken).mockReturnValue('valid-token');
    vi.mocked(getSessionFromToken).mockResolvedValue(mockUser);

    const result = await validateAuthToken(req);

    expect(getSessionFromToken).toHaveBeenCalledWith('valid-token');
    expect(result).toEqual({ success: true, user: mockUser });
  });

  it('returns missing token error when no token present', async () => {
    const req = createAuthenticatedRequest('GET', reqUrl, undefined, null);
    vi.mocked(extractAuthToken).mockReturnValue(null);

    const result = await validateAuthToken(req);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(AUTH_ERROR_MAP.MISSING_TOKEN.code);
  });

  it('returns invalid token error when session not found', async () => {
    const req = createAuthenticatedRequest('GET', reqUrl, undefined, 'bad-token');
    vi.mocked(extractAuthToken).mockReturnValue('bad-token');
    vi.mocked(getSessionFromToken).mockResolvedValue(null);

    const result = await validateAuthToken(req);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(AUTH_ERROR_MAP.INVALID_TOKEN.code);
  });

  it('wraps unexpected errors from session lookup', async () => {
    const req = createAuthenticatedRequest('GET', reqUrl, undefined, 'token');
    vi.mocked(extractAuthToken).mockReturnValue('token');
    vi.mocked(getSessionFromToken).mockRejectedValue(new Error('boom'));

    const result = await validateAuthToken(req);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('SERVER_GENERAL_001');
  });
});
