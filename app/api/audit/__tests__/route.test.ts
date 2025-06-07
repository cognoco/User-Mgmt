import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@app/api/audit/route';
import { withRouteAuth } from '@/middleware/auth';
import { hasPermission } from '@/lib/auth/hasPermission';
import { getApiAuditService } from '@/services/audit/factory';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers';

vi.mock('@/middleware/auth', () => ({ withRouteAuth: vi.fn((h: any) => h) }));
vi.mock('@/lib/auth/hasPermission', () => ({ hasPermission: vi.fn().mockResolvedValue(true) }));
vi.mock('@/services/audit/factory', () => ({ getApiAuditService: vi.fn() }));

describe('audit route', () => {
  const service = { getLogs: vi.fn() } as any;
  beforeEach(() => {
    vi.mocked(getApiAuditService).mockReturnValue(service);
    vi.clearAllMocks();
  });

  it('returns logs', async () => {
    service.getLogs.mockResolvedValue({ logs: [], count: 0 });
    const res = await GET(createAuthenticatedRequest('GET', 'http://t?page=1&limit=10'));
    expect(res.status).toBe(200);
    expect(service.getLogs).toHaveBeenCalled();
  });
});
