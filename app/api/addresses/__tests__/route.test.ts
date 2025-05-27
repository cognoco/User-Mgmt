import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import { getApiAddressService } from '@/services/address/factory';

vi.mock('@/services/address/factory', () => ({
  getApiAddressService: vi.fn(),
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
    req.headers.set('x-user-id', 'u1');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    expect(service.getAddresses).toHaveBeenCalledWith('u1');
  });

  it('GET requires auth', async () => {
    const req = new NextRequest('http://test');
    const res = await GET(req as any);
    expect(res.status).toBe(401);
  });

  it('POST creates address', async () => {
    const req = new NextRequest('http://test', { method: 'POST', body: JSON.stringify({ type: 'shipping', fullName: 'John', street1: '123', city: 'A', state: 'B', postalCode: '1', country: 'US' }) });
    req.headers.set('x-user-id', 'u1');
    (req as any).json = async () => ({ type: 'shipping', fullName: 'John', street1: '123', city: 'A', state: 'B', postalCode: '1', country: 'US' });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
    expect(service.createAddress).toHaveBeenCalled();
  });

  it('POST validates input', async () => {
    const req = new NextRequest('http://test', { method: 'POST', body: '{}' });
    req.headers.set('x-user-id', 'u1');
    (req as any).json = async () => ({}) ;
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
