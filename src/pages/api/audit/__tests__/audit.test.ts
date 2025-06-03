import { describe, it, expect, beforeEach, vi } from 'vitest';
import handler from '../[...audit]';
import { getApiAuditService } from '@/services/audit/factory';
import { testGet } from '@/tests/utils/api-testing-utils';

vi.mock('@/services/audit/factory', () => ({ getApiAuditService: vi.fn() }));

describe('GET /api/audit/permission (pages)', () => {
  const mockService = { getLogs: vi.fn() };
  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuditService as unknown as vi.Mock).mockReturnValue(mockService);
    mockService.getLogs.mockResolvedValue({ logs: [], count: 0 });
  });

  it('filters permission related actions', async () => {
    const logs = [
      { id: '1', createdAt: '2023-01-01', action: 'ROLE_ASSIGNED', status: 'SUCCESS' },
      { id: '2', createdAt: '2023-01-02', action: 'LOGIN_SUCCESS', status: 'SUCCESS' }
    ];
    mockService.getLogs.mockResolvedValue({ logs, count: logs.length });
    const { status, data } = await testGet(handler, { query: { audit: ['permission'] } });
    expect(status).toBe(200);
    expect(data.data.logs).toHaveLength(1);
    expect(data.data.logs[0].action).toBe('ROLE_ASSIGNED');
  });

  it('returns 500 on invalid query', async () => {
    const { status } = await testGet(handler, { query: { audit: ['permission'], limit: 'bad' } });
    expect(status).toBe(500);
  });
});
