import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../route';
import { getApiAuditService } from '@/services/audit/factory';
import { getUserFromRequest } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/auth/hasPermission';
import { NextRequest } from 'next/server';

vi.mock('@/services/audit/factory', () => ({
  getApiAuditService: vi.fn(),
}));
vi.mock('@/lib/auth/utils', () => ({
  getUserFromRequest: vi.fn(),
}));
vi.mock('@/lib/auth/hasPermission', () => ({
  hasPermission: vi.fn(),
}));

describe('GET /api/audit', () => {
  const createRequest = (url: string) => new NextRequest(url);
  const mockService = { getLogs: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuditService as unknown as vi.Mock).mockReturnValue(mockService);
    mockService.getLogs.mockResolvedValue({ logs: [], count: 0 });
    (hasPermission as unknown as vi.Mock).mockResolvedValue(true);
  });

  it('returns 401 when unauthenticated', async () => {
    (getUserFromRequest as unknown as vi.Mock).mockResolvedValue(null);
    const res = await GET(createRequest('http://localhost/api/audit'));
    expect(res.status).toBe(401);
  });

  it('validates query parameters', async () => {
    (getUserFromRequest as unknown as vi.Mock).mockResolvedValue({ id: 'u1' });
    const res = await GET(createRequest('http://localhost/api/audit?page=bad'));
    expect(res.status).toBe(400);
  });

  it('checks permissions when requesting another user', async () => {
    (getUserFromRequest as unknown as vi.Mock).mockResolvedValue({ id: 'u1' });
    (hasPermission as unknown as vi.Mock).mockResolvedValue(false);
    const res = await GET(createRequest('http://localhost/api/audit?userId=u2'));
    expect(res.status).toBe(403);
  });

  it('returns logs from service', async () => {
    (getUserFromRequest as unknown as vi.Mock).mockResolvedValue({ id: 'u1' });
    mockService.getLogs.mockResolvedValueOnce({ logs: [{ id: '1' }], count: 1 });
    const res = await GET(createRequest('http://localhost/api/audit?page=1&limit=10'));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(mockService.getLogs).toHaveBeenCalled();
    expect(data.logs.length).toBe(1);
    expect(data.pagination.total).toBe(1);
  });
});
