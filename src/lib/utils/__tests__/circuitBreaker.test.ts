import { describe, it, expect, vi } from 'vitest';
import { CircuitBreaker } from '@/lib/utils/circuitBreaker';

describe('CircuitBreaker', () => {
  it('opens after failures and recovers after timeout', async () => {
    vi.useFakeTimers();
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      windowDuration: 1000,
      resetTimeout: 5000,
    });

    const fail = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(breaker.exec(fail)).rejects.toThrow();
    await expect(breaker.exec(fail)).rejects.toThrow();
    expect(breaker.getState()).toBe('open');

    vi.advanceTimersByTime(5000);
    const success = vi.fn().mockResolvedValue('ok');
    await expect(breaker.exec(success)).resolves.toBe('ok');
    expect(breaker.getState()).toBe('closed');
  });
});
