/**
 * Simple recovery manager that executes registered recovery callbacks.
 */
export class RecoveryManager {
  private tasks = new Map<string, () => Promise<void>>();

  register(serviceName: string, fn: () => Promise<void>): void {
    this.tasks.set(serviceName, fn);
  }

  async trigger(serviceName: string): Promise<void> {
    const fn = this.tasks.get(serviceName);
    if (fn) {
      try {
        await fn();
      } catch {
        // eslint-disable-next-line no-console
        console.error(`Recovery for ${serviceName} failed`);
      }
    }
  }
}
