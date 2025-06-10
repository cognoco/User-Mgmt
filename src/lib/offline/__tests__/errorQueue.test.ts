import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OfflineErrorQueue, SerializedError } from '@/lib/offline/errorQueue';

describe('OfflineErrorQueue', () => {
  let queue: OfflineErrorQueue;
  let processor: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    queue = new OfflineErrorQueue('test-error-queue', 1); // baseDelay=1ms for tests
    processor = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('persists queued errors', () => {
    queue.enqueue(new Error('oops'));
    const stored = JSON.parse(localStorage.getItem('test-error-queue') || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].error.message).toBe('oops');
  });

  it('processes critical errors first', async () => {
    const results: string[] = [];
    processor.mockImplementation(async (e: SerializedError) => {
      results.push(e.message);
    });
    queue.enqueue(new Error('normal')); // normal priority
    queue.enqueue(new Error('critical'), 'critical');
    await queue.process(processor);
    expect(results).toEqual(['critical', 'normal']);
  });

  it('retries failed errors with exponential backoff', async () => {
    let attempt = 0;
    processor.mockImplementation(() => {
      attempt += 1;
      return attempt < 2 ? Promise.reject(new Error('fail')) : Promise.resolve();
    });
    queue.enqueue(new Error('retry'));
    await queue.process(processor); // first attempt fails

    let stored = JSON.parse(localStorage.getItem('test-error-queue') || '[]');
    expect(stored[0].attempts).toBe(1);
    const firstNext = stored[0].nextRetry;

    await new Promise(r => setTimeout(r, 2));
    await queue.process(processor); // second attempt succeeds

    stored = JSON.parse(localStorage.getItem('test-error-queue') || '[]');
    expect(stored.length).toBe(0);
    expect(firstNext).toBeLessThan(Date.now());
  });

  it('drops errors after max attempts', async () => {
    processor.mockRejectedValue(new Error('fail'));
    queue.enqueue(new Error('drop'), 'normal', 1); // maxAttempts=1
    await queue.process(processor);
    const stored = JSON.parse(localStorage.getItem('test-error-queue') || '[]');
    expect(stored.length).toBe(0);
  });

  it('skips processing when retry time not reached', async () => {
    processor.mockResolvedValue(undefined);
    const id = queue.enqueue(new Error('wait'));
    const stored = JSON.parse(localStorage.getItem('test-error-queue') || '[]');
    stored[0].nextRetry = Date.now() + 1000;
    localStorage.setItem('test-error-queue', JSON.stringify(stored));
    queue = new OfflineErrorQueue('test-error-queue', 1);
    await queue.process(processor);
    expect(processor).not.toHaveBeenCalled();
    const storedAfter = JSON.parse(localStorage.getItem('test-error-queue') || '[]');
    expect(storedAfter[0].id).toBe(id);
  });

  it('loads existing queue from storage', () => {
    const data = [
      { id: 'a', error: { message: 'm' }, priority: 'normal', attempts: 0, maxAttempts: 5, nextRetry: Date.now() }
    ];
    localStorage.setItem('test-error-queue', JSON.stringify(data));
    const q = new OfflineErrorQueue('test-error-queue', 1);
    expect((q as any).queue.length).toBe(1);
    expect((q as any).queue[0].id).toBe('a');
  });

  it('handles invalid stored data gracefully', () => {
    localStorage.setItem('test-error-queue', 'not json');
    const q = new OfflineErrorQueue('test-error-queue', 1);
    expect((q as any).queue).toEqual([]);
  });

  it('skips items that already exceeded max attempts', async () => {
    const item = { id: 'b', error: { message: 'fail' }, priority: 'normal', attempts: 5, maxAttempts: 5, nextRetry: Date.now() };
    localStorage.setItem('test-error-queue', JSON.stringify([item]));
    queue = new OfflineErrorQueue('test-error-queue', 1);
    await queue.process(processor);
    expect(processor).not.toHaveBeenCalled();
    const stored = JSON.parse(localStorage.getItem('test-error-queue') || '[]');
    expect(stored.length).toBe(0);
  });
});
