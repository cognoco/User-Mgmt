export interface SessionTracker {
  initializeFromStorage(): void;
  initializeSessionCheck(): void;
  updateLastActivity(): void;
  initializeTokenRefresh(expiresAt: number): void;
  cleanup(): void;
}

export interface SessionTrackerDeps {
  refreshToken: () => Promise<boolean>;
  onSessionTimeout: () => void;
}

export class DefaultSessionTracker implements SessionTracker {
  private sessionCheckTimer: NodeJS.Timeout | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly SESSION_CHECK_INTERVAL = 1 * 60 * 1000; // 1 minute

  constructor(private deps: SessionTrackerDeps) {
    this.initializeFromStorage();
  }

  initializeFromStorage(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.deps.refreshToken().then(success => {
          if (success) {
            this.initializeSessionCheck();
          }
        });
      }
    }
  }

  initializeSessionCheck(): void {
    if (this.sessionCheckTimer) {
      clearInterval(this.sessionCheckTimer);
    }

    this.sessionCheckTimer = setInterval(() => {
      if (typeof window !== 'undefined') {
        const lastActivity = parseInt(localStorage.getItem('last_activity') || '0', 10);
        const now = Date.now();
        if (now - lastActivity > this.SESSION_TIMEOUT) {
          this.deps.onSessionTimeout();
        }
      }
    }, this.SESSION_CHECK_INTERVAL);

    this.updateLastActivity();
  }

  updateLastActivity(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_activity', Date.now().toString());
    }
  }

  initializeTokenRefresh(expiresAt: number): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    const now = Date.now();
    const timeUntilRefresh = expiresAt - now - this.TOKEN_REFRESH_THRESHOLD;

    if (timeUntilRefresh > 0) {
      this.tokenRefreshTimer = setTimeout(() => {
        this.deps.refreshToken();
      }, timeUntilRefresh);
    } else {
      this.deps.refreshToken();
    }
  }

  cleanup(): void {
    if (this.sessionCheckTimer) {
      clearInterval(this.sessionCheckTimer);
      this.sessionCheckTimer = null;
    }

    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }
}
