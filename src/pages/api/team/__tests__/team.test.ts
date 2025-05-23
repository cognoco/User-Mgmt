import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../[...team]';
import { getApiTeamService } from '@/services/team/factory';
import { testGet } from '@/tests/utils/api-testing-utils';

vi.mock('@/services/team/factory', () => ({ getApiTeamService: vi.fn() }));

describe('GET /api/team/[id]', () => {
  const mockService = { getTeam: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiTeamService as unknown as vi.Mock).mockReturnValue(mockService);
    mockService.getTeam.mockResolvedValue({ id: 't' });
  });

  it('returns team', async () => {
    const { status } = await testGet(handler, { query: { team: ['123e4567-e89b-12d3-a456-426614174000'] } });
    expect(status).toBe(200);
  });

  it('invalid id', async () => {
    const { status } = await testGet(handler, { query: { team: ['bad'] } });
    expect(status).toBe(400);
  });
});
