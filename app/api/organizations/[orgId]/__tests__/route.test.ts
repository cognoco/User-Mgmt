import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/organizations/[orgId]/route'108;
import { configureServices, resetServiceContainer } from '@/lib/config/serviceContainer'154;
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers'246;


describe('[orgId] API', () => {
  const service = {
    getOrganization: vi.fn(async () => ({ id: 'o1' })),
    updateOrganization: vi.fn(async () => ({ success: true, organization: { id: 'o1' } })),
    deleteOrganization: vi.fn(async () => ({ success: true }))
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    resetServiceContainer();
    configureServices({
      organizationService: service as any,
      authService: { getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }) } as any,
      userService: {} as any,
      permissionService: {} as any,
      teamService: {} as any,
      ssoService: {} as any,
      featureFlags: { permissions: false, teams: false, sso: false },
    });
  });

  it('GET returns organization', async () => {
    const res = await GET(createAuthenticatedRequest('GET', 'http://test'), { params: { orgId: 'o1' } });
    expect(res.status).toBe(200);
    expect(service.getOrganization).toHaveBeenCalledWith('o1');
  });

  it('PUT updates organization', async () => {
    const req = createAuthenticatedRequest('PUT', 'http://test', { name: 'New' });
    (req as any).json = async () => ({ name: 'New' });
    const res = await PUT(req, { params: { orgId: 'o1' } });
    expect(res.status).toBe(200);
    expect(service.updateOrganization).toHaveBeenCalled();
  });

  it('DELETE removes organization', async () => {
    const res = await DELETE(createAuthenticatedRequest('DELETE', 'http://test'), { params: { orgId: 'o1' } });
    expect(res.status).toBe(200);
    expect(service.deleteOrganization).toHaveBeenCalledWith('o1');
  });
});
