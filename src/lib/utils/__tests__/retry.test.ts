import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '@/src/lib/utils/retry';

function createFlakyTask(failures: number) {
  let attempts = 0;
  return vi.fn().mockImplementation(() => {
    attempts++;
    if (attempts <= failures) {
      return Promise.reject({ message: 'Network error', code: 'NETWORK_ERROR' });
    }
    return Promise.resolve('ok');
  });
}

describe('withRetry', () => {
  it('retries the specified number of times', async () => {
    const task = createFlakyTask(1);
    const result = await withRetry(task, { retries: 1, delayMs: 10 });
    expect(result).toBe('ok');
    expect(task).toHaveBeenCalledTimes(2);
  });

  it('throws after exceeding retries', async () => {
    const task = createFlakyTask(2);
    await expect(withRetry(task, { retries: 1, delayMs: 10 })).rejects.toEqual({
      message: 'Network error',
      code: 'NETWORK_ERROR',
    });
    expect(task).toHaveBeenCalledTimes(2);
  });
});
