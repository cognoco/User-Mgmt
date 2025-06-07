import { describe, it, expect, beforeEach, vi } from 'vitest';
import { queueRequest, processQueue, setRequestExecutor, getQueueLength, clearQueue } from '@/src/lib/offline/requestQueue';
import type { RequestOptions } from '@/src/lib/api/client';

const flush = () => new Promise(r => setTimeout(r, 0));

describe('request-queue', () => {
  beforeEach(() => {
    clearQueue();
  });

  it('processes requests by priority', async () => {
    const exec = vi.fn().mockResolvedValue(undefined);
    setRequestExecutor(exec);

    const low: RequestOptions = { method: 'POST', queueIfOffline: true, priority: 1 };
    const high: RequestOptions = { method: 'POST', queueIfOffline: true, priority: 5 };
    await queueRequest('/low', low);
    await queueRequest('/high', high);

    await processQueue();
    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec.mock.calls[0][0]).toBe('/high');
    expect(getQueueLength()).toBe(0);
  });

  it('replaces conflicting requests', async () => {
    const exec = vi.fn().mockResolvedValue(undefined);
    setRequestExecutor(exec);

    const opts: RequestOptions = { method: 'PUT', queueIfOffline: true };
    await queueRequest('/res', opts);
    await queueRequest('/res', opts);

    expect(getQueueLength()).toBe(1);
    await processQueue();
    expect(exec).toHaveBeenCalledTimes(1);
  });

  it('respects dependencies', async () => {
    const exec = vi.fn().mockResolvedValue(undefined);
    setRequestExecutor(exec);

    const firstOpts: RequestOptions = { method: 'POST', queueIfOffline: true };
    const firstId = await queueRequest('/first', firstOpts);
    const depOpts: RequestOptions = { method: 'POST', queueIfOffline: true, dependencies: [firstId] };
    await queueRequest('/second', depOpts);

    await processQueue();
    expect(exec.mock.calls[0][0]).toBe('/first');
    expect(exec.mock.calls[1][0]).toBe('/second');
  });


  it('stops on network error', async () => {
    const exec = vi.fn().mockRejectedValue(new Error('Network Error'));
    setRequestExecutor(exec);
    await queueRequest('/net', { method: 'GET', queueIfOffline: true });
    await processQueue();
    expect(getQueueLength()).toBe(1);
  });

  it('handles missing executor', async () => {
    setRequestExecutor(null as any);
    await queueRequest('/noexec', { method: 'GET', queueIfOffline: true });
    await processQueue();
    expect(getQueueLength()).toBe(1);
  });
});
