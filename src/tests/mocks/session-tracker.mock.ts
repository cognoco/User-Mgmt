import { vi } from 'vitest';

export interface MockSession {
  token: string;
  userId: string;
  ip: string;
  userAgent: string;
  createdAt: number;
}

export function createSessionTrackerMock(sessionTimeout = 30 * 60 * 1000) {
  const sessions = new Map<string, MockSession>();

  async function createSession(
    userId: string,
    ip: string,
    userAgent = ''
  ) {
    const token = Math.random().toString(36).slice(2);
    sessions.set(token, {
      token,
      userId,
      ip,
      userAgent,
      createdAt: Date.now(),
    });
    return { token };
  }

  async function validateSession(
    token: string,
    ip: string,
    userAgent = ''
  ) {
    const session = sessions.get(token);
    if (!session) return false;
    if (session.ip !== ip) return false;
    if (session.userAgent && userAgent && session.userAgent !== userAgent)
      return false;
    if (Date.now() - session.createdAt > sessionTimeout) return false;
    return true;
  }

  return {
    createSession: vi.fn(createSession),
    validateSession: vi.fn(validateSession),
  };
}
