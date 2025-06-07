import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/company/validate/registration/route'64;
import { getApiCompanyService } from '@/services/company/factory';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers'166;

vi.mock('@/services/company/factory', () => ({
  getApiCompanyService: vi.fn(),
}));

vi.mock('@/middleware/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(false)),
}));

vi.mock('@/lib/api/auth-middleware', () => ({
  createAuthMiddleware: vi.fn(() => async () => ({ isAuthenticated: true, userId: 'u1' })),
}));

describe('POST /api/company/validate/registration', () => {
  const service = {
    getProfileByUserId: vi.fn(),
    updateProfile: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getApiCompanyService).mockReturnValue(service);
    service.getProfileByUserId.mockResolvedValue({ id: 'cp1' });
    service.updateProfile.mockResolvedValue({});
  });

  it('validates and updates profile', async () => {
    const req = createAuthenticatedRequest('POST', 'http://localhost/api/company/validate/registration', {
      registrationNumber: '12345678',
      countryCode: 'GB',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(service.getProfileByUserId).toHaveBeenCalledWith('u1');
    expect(service.updateProfile).toHaveBeenCalledWith('cp1', expect.objectContaining({
      registration_number_verified: true,
    }));
    expect(data.status).toBe('valid');
  });

  it('returns 404 when profile missing', async () => {
    service.getProfileByUserId.mockResolvedValueOnce(null);
    const req = createAuthenticatedRequest('POST', 'http://localhost/api/company/validate/registration', {
      registrationNumber: '12345678',
      countryCode: 'GB',
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('returns 429 when rate limited', async () => {
    const { checkRateLimit } = await import('@/middleware/rateLimit');
    vi.mocked(checkRateLimit).mockResolvedValueOnce(true);

    const req = createAuthenticatedRequest('POST', 'http://localhost/api/company/validate/registration', {
      registrationNumber: '12345678',
      countryCode: 'GB',
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });
});
