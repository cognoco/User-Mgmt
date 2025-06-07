import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiUserService } from '@/services/user/apiUser.service';

describe('ApiUserService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('getUserProfile fetches profile', async () => {
    const service = new ApiUserService();
    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: 'u1' } })
    });
    const res = await service.getUserProfile('u1');
    expect(global.fetch).toHaveBeenCalledWith('/api/profile', expect.any(Object));
    expect(res).toEqual({ id: 'u1' });
  });

  it('updateUserPreferences posts data', async () => {
    const service = new ApiUserService();
    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { theme: 'dark' } })
    });
    const res = await service.updateUserPreferences('u1', { theme: 'dark' } as any);
    expect((global.fetch as any).mock.calls[0][0]).toBe('/api/settings');
    expect(res).toEqual({ success: true, preferences: { theme: 'dark' } });
  });
});
