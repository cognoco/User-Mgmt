import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../[...sso]';
import { getApiSsoService } from '@/services/sso/factory';
import { testGet } from '@/tests/utils/api-testing-utils';

vi.mock('@/services/sso/factory', () => ({ getApiSsoService: vi.fn() }));

describe('GET /api/sso/providers', () => {
  const mockService = { getProviders: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiSsoService as unknown as vi.Mock).mockReturnValue(mockService);
    mockService.getProviders.mockResolvedValue([]);
  });

  it('returns providers', async () => {
    const { status } = await testGet(handler, { query: { sso: ['providers'], organizationId: '123e4567-e89b-12d3-a456-426614174000' } });
    expect(status).toBe(200);
  });

  it('invalid params', async () => {
    const { status } = await testGet(handler, { query: { sso: ['providers'] } });
    expect(status).toBe(400);
  });
});
