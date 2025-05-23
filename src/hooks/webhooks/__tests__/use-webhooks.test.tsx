import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserManagementConfiguration } from '@/core/config';
import { useWebhooks } from '../use-webhooks';
import type { IWebhookService } from '@/core/webhooks';

const mockService: IWebhookService = {
  createWebhook: vi.fn(async () => ({ success: true, webhook: { id: '1', userId: 'u1', name: 'n', url: 'url', events: [], secret: '', isActive: true, createdAt: '' } })),
  getWebhooks: vi.fn(async () => []),
  getWebhook: vi.fn(),
  updateWebhook: vi.fn(async () => ({ success: true, webhook: { id: '1', userId: 'u1', name: 'n', url: 'u', events: [], secret: '', isActive: true, createdAt: '' } })),
  deleteWebhook: vi.fn(async () => ({ success: true })),
  getWebhookDeliveries: vi.fn(),
  triggerEvent: vi.fn(async () => [])
};

beforeEach(() => {
  UserManagementConfiguration.reset();
  UserManagementConfiguration.configureServiceProviders({ webhookService: mockService });
  vi.clearAllMocks();
});

describe('useWebhooks', () => {
  it('fetches webhooks', async () => {
    (mockService.getWebhooks as any).mockResolvedValueOnce([{ id: '1', userId: 'u1', name: 'n', url: 'u', events: [], secret: '', isActive: true, createdAt: '' }]);
    const { result } = renderHook(() => useWebhooks('u1'));
    await act(async () => {
      await result.current.fetchWebhooks();
    });
    expect(mockService.getWebhooks).toHaveBeenCalledWith('u1');
    expect(result.current.webhooks.length).toBe(1);
  });

  it('creates webhook', async () => {
    const { result } = renderHook(() => useWebhooks('u1'));
    await act(async () => {
      await result.current.createWebhook({ name: 'n', url: 'u', events: [] });
    });
    expect(mockService.createWebhook).toHaveBeenCalled();
    expect(result.current.webhooks.length).toBe(1);
  });
});
