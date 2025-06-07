import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/team/roles/[roleId]/route'48;

describe('team role id API', () => {
  it('GET returns role for valid id', async () => {
    const res = await GET({} as any, { params: { roleId: 'ADMIN' } } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.role.id).toBe('ADMIN');
  });

  it('GET returns 404 for invalid id', async () => {
    const res = await GET({} as any, { params: { roleId: 'unknown' } } as any);
    expect(res.status).toBe(404);
  });
});
