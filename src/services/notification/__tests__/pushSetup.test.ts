import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DefaultNotificationService } from '@/src/services/notification/defaultNotification.service';

const createProvider = () => ({
  registerDevice: vi.fn(),
  unregisterDevice: vi.fn(),
});

const createHandler = () => ({
  registerDevice: vi.fn().mockResolvedValue(true),
  unregisterDevice: vi.fn().mockResolvedValue(true),
});

describe('DefaultNotificationService device registration', () => {
  let provider: any;
  let handler: any;
  let service: DefaultNotificationService;

  beforeEach(() => {
    provider = createProvider();
    handler = createHandler();
    service = new DefaultNotificationService(provider, handler);
  });

  it('registers device via provider and handler on success', async () => {
    provider.registerDevice.mockResolvedValue({ success: true });
    const res = await service.registerDevice('u1', 't1');
    expect(res).toEqual({ success: true });
    expect(provider.registerDevice).toHaveBeenCalledWith('u1', 't1', undefined);
    expect(handler.registerDevice).toHaveBeenCalledWith('u1');
  });

  it('does not call handler when provider fails', async () => {
    provider.registerDevice.mockResolvedValue({ success: false, error: 'x' });
    const res = await service.registerDevice('u1', 't1');
    expect(res).toEqual({ success: false, error: 'x' });
    expect(handler.registerDevice).not.toHaveBeenCalled();
  });

  it('unregisters device via provider and handler', async () => {
    provider.unregisterDevice.mockResolvedValue({ success: true });
    const res = await service.unregisterDevice('u1', 't1');
    expect(res).toEqual({ success: true });
    expect(provider.unregisterDevice).toHaveBeenCalledWith('u1', 't1');
    expect(handler.unregisterDevice).toHaveBeenCalledWith('u1');
  });
});
