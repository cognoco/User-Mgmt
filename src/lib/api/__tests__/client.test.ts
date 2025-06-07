import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { OfflineError } from '@/src/lib/api/client'64;
import * as detector from '@/src/lib/offline/networkDetector'112;
import * as queue from '@/src/lib/offline/requestQueue'173;

vi.mock('../axios', () => ({ api: { request: vi.fn() } }));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('apiRequest', () => {
  it('queues request when offline', async () => {
    vi.spyOn(detector, 'detectNetworkStatus').mockResolvedValue(false);
    const queueSpy = vi.spyOn(queue, 'queueRequest').mockResolvedValue('1');
    const { apiRequest } = await import('@/src/lib/api/client');
    await expect(apiRequest('/a', { method: 'GET', queueIfOffline: true })).rejects.toMatchObject({ name: 'OfflineError' });
    expect(queueSpy).toHaveBeenCalledWith('/a', expect.objectContaining({ method: 'GET' }));
  });

  it('throws OfflineError when offline without queueing', async () => {
    vi.spyOn(detector, 'detectNetworkStatus').mockResolvedValue(false);
    const queueSpy = vi.spyOn(queue, 'queueRequest');
    const { apiRequest } = await import('@/src/lib/api/client');
    await expect(apiRequest('/a', { method: 'GET' })).rejects.toMatchObject({ name: 'OfflineError' });
    expect(queueSpy).not.toHaveBeenCalled();
  });

  it('calls performRequest when online', async () => {
    vi.spyOn(detector, 'detectNetworkStatus').mockResolvedValue(true);
    const { api } = await import('@/src/lib/api/axios');
    (api.request as any).mockResolvedValue({ data: 'ok' });
    const { apiRequest: realApiRequest } = await import('@/src/lib/api/client');
    const result = await realApiRequest('/b', { method: 'GET' });
    expect(result).toBe('ok');
  });

  it('queues on network error', async () => {
    vi.spyOn(detector, 'detectNetworkStatus').mockResolvedValue(true);
    const { api } = await import('@/src/lib/api/axios');
    (api.request as any).mockRejectedValue(new Error('Network Error'));
    const queueSpy = vi.spyOn(queue, 'queueRequest').mockResolvedValue('1');
    const { apiRequest: realApiRequest } = await import('@/src/lib/api/client');
    await expect(realApiRequest('/c', { method: 'GET', queueIfOffline: true })).rejects.toMatchObject({ name: 'OfflineError' });
    expect(queueSpy).toHaveBeenCalled();
  });

  it('enhances non-network errors', async () => {
    vi.spyOn(detector, 'detectNetworkStatus').mockResolvedValue(true);
    const { api } = await import('@/src/lib/api/axios');
    (api.request as any).mockRejectedValue(new Error('Server Error'));
    const { apiRequest: realApiRequest } = await import('@/src/lib/api/client');
    await expect(realApiRequest('/d', { method: 'POST' })).rejects.toMatchObject({ endpoint: '/d' });
  });
});
