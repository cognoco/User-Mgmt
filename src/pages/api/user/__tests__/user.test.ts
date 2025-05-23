import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../[...user]';
import { getApiUserService } from '@/services/user/factory';
import { testGet } from '@/tests/utils/api-testing-utils';

vi.mock('@/services/user/factory', () => ({ getApiUserService: vi.fn() }));

describe('GET /api/user/search', () => {
  const mockService = { searchUsers: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiUserService as unknown as vi.Mock).mockReturnValue(mockService);
    mockService.searchUsers.mockResolvedValue({ users: [] });
  });

  it('returns 200', async () => {
    const { status } = await testGet(handler, { query: { user: ['search'], query: 'a' } });
    expect(status).toBe(200);
  });

  it('invalid query', async () => {
    const { status } = await testGet(handler, { query: { user: ['search'] } });
    expect(status).toBe(400);
  });
});
