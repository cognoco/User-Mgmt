import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { getApiAddressService } from '@/services/address/factory';
import { withRouteAuth } from '@/middleware/auth';
import { withSecurity } from '@/middleware/with-security';

vi.mock('@/services/address/factory', () => ({
  getApiAddressService: vi.fn(),
}));
vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));
vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any, req: any) => handler(req, { userId: 'u1', role: 'user', permissions: [] })),
}));

describe('default address API', () => {
  const service = { setDefaultAddress: vi.fn(async () => {}) } as any;

  beforeEach(() => {
    vi.mocked(getApiAddressService).mockReturnValue(service);
    vi.clearAllMocks();
  });

  it('sets default address', async () => {
    const req = new NextRequest('http://test', { method: 'POST' });
    const res = await POST(req as any, { params: { id: '1' } });
    expect(res.status).toBe(204);
    expect(service.setDefaultAddress).toHaveBeenCalledWith('1', 'u1');
  });
});
