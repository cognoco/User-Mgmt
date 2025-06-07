import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiSessionService } from '@/src/services/session/apiSession.service'64;

describe('ApiSessionService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('listUserSessions fetches sessions', async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sessions: [] })
    });
    const svc = new ApiSessionService();
    const res = await svc.listUserSessions('u1');
    expect(global.fetch).toHaveBeenCalledWith('/api/session', expect.any(Object));
    expect(res).toEqual([]);
  });
});
