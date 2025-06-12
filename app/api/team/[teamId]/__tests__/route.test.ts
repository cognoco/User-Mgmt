import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH, DELETE } from '@app/api/team/[teamId]/route';
import { getApiTeamService } from '@/services/team/factory';
import { callRouteWithParams } from '../../../../../tests/utils/callRoute';

vi.mock('@/services/team/factory', () => ({ getApiTeamService: vi.fn() }));
vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any) => async (req: any) => {
    (req as any).auth = { userId: 'u1', role: 'user' };
    return handler(req, { userId: 'u1', role: 'user' });
  })
}));

describe('[teamId] API', () => {
  const service = {
    getTeam: vi.fn(async () => ({ id: 't1' })),
    updateTeam: vi.fn(async () => ({ success: true, team: { id: 't1' } })),
    deleteTeam: vi.fn(async () => ({ success: true }))
  } as any;

  beforeEach(() => {
    vi.mocked(getApiTeamService).mockReturnValue(service);
    vi.clearAllMocks();
  });

  it('GET returns team', async () => {
    const res = await callRouteWithParams(GET, { teamId: 't1' });
    expect(res.status).toBe(200);
    expect(service.getTeam).toHaveBeenCalledWith('t1');
  });

  it('GET validates teamId', async () => {
    const res = await callRouteWithParams(GET, { teamId: '' });
    expect(res.status).toBe(400);
  });

  it('PATCH updates team', async () => {
    const res = await callRouteWithParams(PATCH, { teamId: 't1' }, 'http://test', {
      method: 'PATCH',
      body: { name: 'New' }
    });
    expect(res.status).toBe(200);
    expect(service.updateTeam).toHaveBeenCalled();
  });

  it('DELETE removes team', async () => {
    const res = await callRouteWithParams(DELETE, { teamId: 't1' }, 'http://test', {
      method: 'DELETE'
    });
    expect(res.status).toBe(200);
    expect(service.deleteTeam).toHaveBeenCalledWith('t1');
  });
});
