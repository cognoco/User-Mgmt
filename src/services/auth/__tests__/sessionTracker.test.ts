import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultSessionTracker } from '@/services/auth/sessionTracker';
import { createSessionTrackerMock } from "@/tests/mocks/sessionTracker.mock";

describe('DefaultSessionTracker', () => {
  let refresh: any;
  let onTimeout: any;

  beforeEach(() => {
    refresh = vi.fn().mockResolvedValue(true);
    onTimeout = vi.fn();
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    });
    vi.useFakeTimers();
  });

  it('refreshes token from storage', async () => {
    (localStorage.getItem as any).mockReturnValue('tok');
    new DefaultSessionTracker({ refreshToken: refresh, onSessionTimeout: onTimeout });
    // Only flush pending microtasks to avoid running the interval in
    // `initializeSessionCheck`, which would cause an infinite loop with
    // `runAllTimersAsync`.
    await vi.runAllTicks();
    expect(refresh).toHaveBeenCalled();
  });

  it('calls timeout when session expires', async () => {
    (localStorage.getItem as any).mockReturnValue(null);
    const tracker = new DefaultSessionTracker({ refreshToken: refresh, onSessionTimeout: onTimeout });
    tracker.initializeSessionCheck();
    (localStorage.getItem as any).mockReturnValue('0');
    vi.advanceTimersByTime(31 * 60 * 1000);
    expect(onTimeout).toHaveBeenCalled();
  });

  it('schedules token refresh', () => {
    (localStorage.getItem as any).mockReturnValue(null);
    const tracker = new DefaultSessionTracker({ refreshToken: refresh, onSessionTimeout: onTimeout });
    tracker.initializeTokenRefresh(Date.now() + 10 * 1000);
    vi.advanceTimersByTime(10 * 1000);
    expect(refresh).toHaveBeenCalled();
  });
});


describe('SessionTracker', () => {
  const userId = 'user-1';
  const SESSION_TIMEOUT = 30 * 60 * 1000;
  let sessionTracker: ReturnType<typeof createSessionTrackerMock>;

  beforeEach(() => {
    vi.useFakeTimers();
    sessionTracker = createSessionTrackerMock(SESSION_TIMEOUT);
  });

  describe('Session Hijacking Protection', () => {
    it('should detect IP address changes', async () => {
      const session = await sessionTracker.createSession(userId, '192.168.1.1');

      const isValid = await sessionTracker.validateSession(
        session.token,
        '192.168.1.2'
      );

      expect(isValid).toBe(false);
    });

    it('should detect user agent changes', async () => {
      const session = await sessionTracker.createSession(
        userId,
        '192.168.1.1',
        'Mozilla/5.0 (original)'
      );

      const isValid = await sessionTracker.validateSession(
        session.token,
        '192.168.1.1',
        'Mozilla/5.0 (different)'
      );

      expect(isValid).toBe(false);
    });
  });

  describe('Session Timeout', () => {
    it('should expire sessions after timeout', async () => {
      const session = await sessionTracker.createSession(userId, '192.168.1.1');

      vi.advanceTimersByTime(SESSION_TIMEOUT + 1000);

      const isValid = await sessionTracker.validateSession(
        session.token,
        '192.168.1.1'
      );

      expect(isValid).toBe(false);
    });
  });
});
