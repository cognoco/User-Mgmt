import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultSessionTracker } from '../session-tracker';

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
    await vi.runAllTimersAsync();
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
