import { describe, it, expect, beforeEach } from 'vitest';
import { SupabaseTeamProvider } from '../supabase-team-provider';
import { setTableMockData, resetSupabaseMock } from '@/tests/mocks/supabase';

const SUPABASE_URL = 'http://localhost';
const SUPABASE_KEY = 'anon';

const teamRecord = {
  id: 'team-1',
  name: 'Team 1',
  description: 'Desc',
  owner_id: 'user-1',
  is_public: false,
  settings: {},
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-02T00:00:00Z'
};

describe('SupabaseTeamProvider', () => {
  beforeEach(() => {
    resetSupabaseMock();
    setTableMockData('teams', { data: [teamRecord], error: null });
  });

  it('retrieves a team by id', async () => {
    const provider = new SupabaseTeamProvider(SUPABASE_URL, SUPABASE_KEY);
    const result = await provider.getTeam('team-1');

    expect(result).toEqual({
      id: 'team-1',
      name: 'Team 1',
      description: 'Desc',
      ownerId: 'user-1',
      isPublic: false,
      settings: {},
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z')
    });
  });
});
