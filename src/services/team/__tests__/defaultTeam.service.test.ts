import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultTeamService } from '@/src/services/team/defaultTeam.service';
import type { TeamDataProvider } from '@/core/team/ITeamDataProvider';
import { prisma } from '@/lib/database/prisma';

vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    teamLicense: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('DefaultTeamService seat limits', () => {
  let provider: TeamDataProvider;
  let service: DefaultTeamService;

  beforeEach(() => {
    provider = {
      addTeamMember: vi.fn(),
      inviteToTeam: vi.fn(),
    } as unknown as TeamDataProvider;
    service = new DefaultTeamService(provider);
    (prisma.teamLicense.update as any).mockResolvedValue(undefined);
  });

  it('addTeamMember fails when seats are exhausted', async () => {
    (prisma.teamLicense.findUnique as any).mockResolvedValue({ usedSeats: 5, totalSeats: 5 });
    const result = await service.addTeamMember('t1', 'u1', 'member');
    expect(result.success).toBe(false);
    expect((provider.addTeamMember as any)).not.toHaveBeenCalled();
  });

  it('inviteToTeam fails when seats are exhausted', async () => {
    (prisma.teamLicense.findUnique as any).mockResolvedValue({ usedSeats: 2, totalSeats: 2 });
    const result = await service.inviteToTeam('t1', { email: 'a@a.com', role: 'member' });
    expect(result.success).toBe(false);
    expect((provider.inviteToTeam as any)).not.toHaveBeenCalled();
  });
});
