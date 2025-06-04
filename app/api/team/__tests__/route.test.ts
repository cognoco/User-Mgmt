import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { configureServices, resetServiceContainer } from '@/lib/config/service-container';
import type { TeamService } from '@/core/team/interfaces';
import type { AuthService } from '@/core/auth/interfaces';


describe('team API', () => {
  const mockTeamService: Partial<TeamService> = {
    getUserTeams: vi.fn(async () => []),
    createTeam: vi.fn(async () => ({ success: true, team: { id: 't' } })),
  };
  const mockAuthService: Partial<AuthService> = {
    getCurrentUser: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetServiceContainer();
    (mockAuthService.getCurrentUser as any).mockResolvedValue({ id: 'u1' });
    configureServices({
      teamService: mockTeamService as TeamService,
      authService: mockAuthService as AuthService,
    });
  });

  it('GET returns teams', async () => {
    const req = new NextRequest('http://test', { headers: { authorization: 'Bearer token' } });
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    expect(mockTeamService.getUserTeams).toHaveBeenCalledWith('u1');
  });

  it('POST creates team', async () => {
    const req = new NextRequest('http://test', { method: 'POST', body: JSON.stringify({ name: 'My Team' }), headers: { authorization: 'Bearer token' } });
    (req as any).json = async () => ({ name: 'My Team' });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
    expect(mockTeamService.createTeam).toHaveBeenCalled();
  });
});
