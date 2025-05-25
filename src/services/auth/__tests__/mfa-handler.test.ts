import { describe, it, expect, vi } from 'vitest';
import { DefaultMFAHandler } from '../mfa-handler';

const provider = {
  setupMFA: vi.fn(),
  verifyMFA: vi.fn(),
  disableMFA: vi.fn()
};

const handler = new DefaultMFAHandler(provider as any);

describe('DefaultMFAHandler', () => {
  it('delegates setup', async () => {
    provider.setupMFA.mockResolvedValue({ success: true });
    const res = await handler.setupMFA();
    expect(provider.setupMFA).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it('delegates verify', async () => {
    provider.verifyMFA.mockResolvedValue({ success: true });
    const res = await handler.verifyMFA('123');
    expect(provider.verifyMFA).toHaveBeenCalledWith('123');
    expect(res.success).toBe(true);
  });

  it('delegates disable', async () => {
    provider.disableMFA.mockResolvedValue({ success: true });
    const res = await handler.disableMFA('456');
    expect(provider.disableMFA).toHaveBeenCalledWith('456');
    expect(res.success).toBe(true);
  });
});
