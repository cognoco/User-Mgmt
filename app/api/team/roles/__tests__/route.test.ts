import { describe, it, expect, vi } from 'vitest';
import { GET } from '@app/api/team/roles/route';
import * as rolesUtil from '@/lib/rbac/roles';

describe('team roles API', () => {
  it('GET returns roles', async () => {
    vi.spyOn(rolesUtil, 'getAllRoles').mockReturnValue([{ id: 'ADMIN' }] as any);
    const res = await GET({} as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.roles).toEqual([{ id: 'ADMIN' }]);
  });
});
