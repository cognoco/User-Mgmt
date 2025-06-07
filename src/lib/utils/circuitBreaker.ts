export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  failureThreshold: number;
  windowDuration: number;
  resetTimeout: number;
  onOpen?: () => void;
  onClose?: () => void;
}

/** Simple time based circuit breaker */
export class CircuitBreaker {
  private failures: number[] = [];
  private state: CircuitState = 'closed';
  private lastStateChange = Date.now();

  constructor(private options: CircuitBreakerOptions) {}

  getState(): CircuitState {
    return this.state;
  }

  async exec<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastStateChange >= this.options.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit open');
      }
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  private recordFailure() {
    const now = Date.now();
    this.failures.push(now);
    this.failures = this.failures.filter(t => now - t <= this.options.windowDuration);
    if (this.failures.length >= this.options.failureThreshold) {
      this.open();
    }
  }

  private recordSuccess() {
    this.failures = [];
    if (this.state === 'half-open') {
      this.close();
    }
  }

  private open() {
    if (this.state !== 'open') {
      this.state = 'open';
      this.lastStateChange = Date.now();
      this.options.onOpen?.();
    }
  }

  private close() {
    if (this.state !== 'closed') {
      this.state = 'closed';
      this.failures = [];
      this.lastStateChange = Date.now();
      this.options.onClose?.();
    }
  }
}
