import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import { getApiAddressService } from '@/services/address/factory';
import { withRouteAuth } from '@/middleware/auth';
import { withSecurity } from '@/middleware/with-security';

vi.mock('@/services/address/factory', () => ({
  getApiAddressService: vi.fn(),
}));
vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));
vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any, req: any) => handler(req, 'u1')),
}));

describe('addresses API', () => {
  const service = {
    getAddresses: vi.fn(async () => []),
    createAddress: vi.fn(async (a: any) => a),
  } as any;

  beforeEach(() => {
    vi.mocked(getApiAddressService).mockReturnValue(service);
    vi.clearAllMocks();
  });

  it('GET returns addresses', async () => {
    const req = new NextRequest('http://test');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    expect(service.getAddresses).toHaveBeenCalledWith('u1');
  });

  it('POST creates address', async () => {
    const req = new NextRequest('http://test', { method: 'POST', body: JSON.stringify({ type: 'shipping', fullName: 'John', street1: '123', city: 'A', state: 'B', postalCode: '1', country: 'US' }) });
    (req as any).json = async () => ({ type: 'shipping', fullName: 'John', street1: '123', city: 'A', state: 'B', postalCode: '1', country: 'US' });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
    expect(service.createAddress).toHaveBeenCalled();
  });
});
