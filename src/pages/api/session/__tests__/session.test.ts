import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../[...session]';
import { getApiSessionService } from '@/services/session/factory';
import { testGet } from '@/tests/utils/api-testing-utils';

vi.mock('@/services/session/factory', () => ({ getApiSessionService: vi.fn() }));

describe('GET /api/session/list', () => {
  const mockService = { listUserSessions: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiSessionService as unknown as vi.Mock).mockReturnValue(mockService);
    mockService.listUserSessions.mockResolvedValue([]);
  });

  it('returns sessions', async () => {
    const { status } = await testGet(handler, { query: { session: ['list'], userId: '123e4567-e89b-12d3-a456-426614174000' } });
    expect(status).toBe(200);
  });

  it('invalid params', async () => {
    const { status } = await testGet(handler, { query: { session: ['list'] } });
    expect(status).toBe(400);
  });
});
