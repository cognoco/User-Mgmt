import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiPermissionService } from '@/services/permission/apiPermission.service';

describe('ApiPermissionService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('getAllPermissions fetches list', async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { permissions: ['READ'] } })
    });
    const svc = new ApiPermissionService();
    const res = await svc.getAllPermissions();
    expect(global.fetch).toHaveBeenCalledWith('/api/permissions', expect.any(Object));
    expect(res).toEqual(['READ']);
  });
});
