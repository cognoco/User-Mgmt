import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../[...permission]';
import { getApiPermissionService } from '@/services/permission/factory';
import { testGet } from '@/tests/utils/api-testing-utils';

vi.mock('@/services/permission/factory', () => ({ getApiPermissionService: vi.fn() }));

describe('GET /api/permission/check', () => {
  const mockService = { hasPermission: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiPermissionService as unknown as vi.Mock).mockReturnValue(mockService);
    mockService.hasPermission.mockResolvedValue(true);
  });

  it('returns result', async () => {
    const { status } = await testGet(handler, {
      query: {
        permission: ['check', 'READ'],
        userId: '123e4567-e89b-12d3-a456-426614174000'
      }
    });
    expect(status).toBe(200);
  });

  it('invalid params', async () => {
    const { status } = await testGet(handler, { query: { permission: ['check'] } });
    expect(status).toBe(400);
  });
});
