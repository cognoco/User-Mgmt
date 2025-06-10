export class RefreshManager {
  private timers: Record<string, NodeJS.Timeout> = {};
  private readonly defaultIntervalMs: number;

  constructor(defaultIntervalMs = 30000) {
    this.defaultIntervalMs = defaultIntervalMs;
  }

  startRefresh(key: string, callback: () => Promise<void>, intervalMs = this.defaultIntervalMs): void {
    this.stopRefresh(key);
    this.timers[key] = setInterval(async () => {
      try {
        await callback();
      } catch (error) {
        console.error(`Background refresh failed for ${key}:`, error);
      }
    }, intervalMs);
  }

  stopRefresh(key: string): void {
    if (this.timers[key]) {
      clearInterval(this.timers[key]);
      delete this.timers[key];
    }
  }

  stopAll(): void {
    Object.keys(this.timers).forEach((k) => {
      clearInterval(this.timers[k]);
    });
    this.timers = {};
  }
}
