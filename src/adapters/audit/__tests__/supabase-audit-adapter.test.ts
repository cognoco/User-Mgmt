import { describe, it, expect, beforeEach } from 'vitest';
import { SupabaseAuditAdapter } from '../supabase-adapter';
import { setTableMockData, resetSupabaseMock } from '@/tests/mocks/supabase';

const SUPABASE_URL = 'http://localhost';
const SUPABASE_KEY = 'anon';

const logRecord = {
  id: 1,
  created_at: '2024-01-01T00:00:00Z',
  user_id: 'user-1',
  action: 'LOGIN',
  status: 'SUCCESS',
  ip_address: '127.0.0.1',
  user_agent: 'test',
  target_resource_type: 'auth',
  target_resource_id: 'user-1',
  details: { foo: 'bar' },
};

describe('SupabaseAuditAdapter', () => {
  beforeEach(() => {
    resetSupabaseMock();
    setTableMockData('user_actions_log', { data: [logRecord], error: null, count: 1 });
  });

  it('fetches user action logs', async () => {
    const adapter = new SupabaseAuditAdapter(SUPABASE_URL, SUPABASE_KEY);
    const { logs, count } = await adapter.getUserActionLogs({ page: 1, limit: 10 });

    expect(count).toBe(1);
    expect(logs[0]).toEqual({
      id: '1',
      createdAt: '2024-01-01T00:00:00Z',
      userId: 'user-1',
      action: 'LOGIN',
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      userAgent: 'test',
      targetResourceType: 'auth',
      targetResourceId: 'user-1',
      details: { foo: 'bar' },
    });
  });
});
