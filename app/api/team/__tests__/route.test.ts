import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { getApiTeamService } from '@/services/team/factory';

vi.mock('@/services/team/factory', () => ({
  getApiTeamService: vi.fn()
}));

describe('team API', () => {
  const service = {
    getUserTeams: vi.fn(async () => []),
    createTeam: vi.fn(async () => ({ success: true, team: { id: 't' } }))
  } as any;

  beforeEach(() => {
    vi.mocked(getApiTeamService).mockReturnValue(service);
    vi.clearAllMocks();
  });

  it('GET returns teams', async () => {
    const req = new NextRequest('http://test');
    req.headers.set('x-user-id', 'u1');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    expect(service.getUserTeams).toHaveBeenCalledWith('u1');
  });

  it('POST creates team', async () => {
    const req = new NextRequest('http://test', { method: 'POST', body: JSON.stringify({ name: 'My Team' }) });
    req.headers.set('x-user-id', 'u1');
    (req as any).json = async () => ({ name: 'My Team' });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
    expect(service.createTeam).toHaveBeenCalled();
  });
});
