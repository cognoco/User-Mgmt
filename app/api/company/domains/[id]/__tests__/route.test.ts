import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DELETE, PATCH } from '@/app/api/company/domains/[id]/route';
import { getApiCompanyService } from '@/services/company/factory';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers';
import { checkPermission } from '@/lib/auth/permissionCheck';

vi.mock('@/services/company/factory', () => ({ getApiCompanyService: vi.fn() }));
vi.mock('@/lib/auth/permissionCheck', () => ({ checkPermission: vi.fn().mockResolvedValue(true) }));
vi.mock('@/middleware/rate-limit', () => ({ checkRateLimit: vi.fn().mockResolvedValue(false) }));
vi.mock('@/middleware/auth', () => ({ withRouteAuth: vi.fn((h: any, r: any) => h(r, { userId: 'u1' })) }));

describe('Company Domain By ID API', () => {
  const service = {
    getDomainById: vi.fn(),
    deleteDomain: vi.fn(),
    updateDomain: vi.fn(),
    getProfileByUserId: vi.fn(),
    listDomains: vi.fn(() => []),
  } as any;

  beforeEach(() => {
    vi.mocked(getApiCompanyService).mockReturnValue(service);
    vi.clearAllMocks();
    service.getProfileByUserId.mockResolvedValue({ id: 'c1', user_id: 'u1' });
  });

  it('deletes domain', async () => {
    service.getDomainById.mockResolvedValue({ id: 'd1', is_primary: false, company_id: 'c1' });
    const res = await DELETE(createAuthenticatedRequest('DELETE', 'http://t'), { params: { id: 'd1' } } as any);
    expect(res.status).toBe(200);
    expect(service.deleteDomain).toHaveBeenCalledWith('d1');
  });

  it('updates domain', async () => {
    service.getDomainById.mockResolvedValue({ id: 'd1', is_primary: false, company_id: 'c1' });
    service.updateDomain.mockResolvedValue({ id: 'd1' });
    const res = await PATCH(createAuthenticatedRequest('PATCH', 'http://t', { is_primary: true }), { params: { id: 'd1' } } as any);
    expect(res.status).toBe(200);
    expect(service.updateDomain).toHaveBeenCalled();
  });
});
