import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../session', () => {
  return {
    getCurrentSession: vi.fn(),
    getCurrentUser: vi.fn(),
    getSessionFromRequest: vi.fn(),
    isSessionValid: vi.fn(),
    refreshSession: vi.fn(),
    handleSessionTimeout: vi.fn(),
    persistSession: vi.fn(),
  };
});

vi.mock('../utils', () => {
  return {
    extractAuthToken: vi.fn(),
    validateAuthToken: vi.fn(),
    verifyEmailToken: vi.fn(),
    getUserFromRequest: vi.fn(),
  };
});

// Import after mocks
import {
  getSession,
  getCurrentUser,
  getUserId,
  extractAuthToken,
  validateAuthToken,
  verifyEmailToken,
  getUserFromRequest,
} from '@/lib/auth/index';
import * as sessionModule from '@/lib/auth/session';
import * as utilsModule from '@/lib/auth/utils';

describe('auth index utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSession returns session from session module', async () => {
    const mockSession = { userId: 'abc' } as any;
    (sessionModule.getCurrentSession as any).mockResolvedValue(mockSession);
    const result = await getSession();
    expect(sessionModule.getCurrentSession).toHaveBeenCalled();
    expect(result).toBe(mockSession);
  });

  it('getCurrentUser returns user from session module', async () => {
    const mockUser = { id: 'u1' } as any;
    (sessionModule.getCurrentUser as any).mockResolvedValue(mockUser);
    const result = await getCurrentUser();
    expect(sessionModule.getCurrentUser).toHaveBeenCalled();
    expect(result).toBe(mockUser);
  });

  it('getUserId resolves id from session module', async () => {
    const mockUser = { id: 'u2' } as any;
    (sessionModule.getCurrentUser as any).mockResolvedValue(mockUser);
    const id = await getUserId();
    expect(id).toBe('u2');
  });

  it('re-exports token utilities', () => {
    expect(extractAuthToken).toBe(utilsModule.extractAuthToken);
    expect(validateAuthToken).toBe(utilsModule.validateAuthToken);
    expect(verifyEmailToken).toBe(utilsModule.verifyEmailToken);
    expect(getUserFromRequest).toBe(utilsModule.getUserFromRequest);
  });
});
