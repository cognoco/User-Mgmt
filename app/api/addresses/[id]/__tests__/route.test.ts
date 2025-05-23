import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../route';
import { getApiAddressService } from '@/services/address/factory';

vi.mock('@/services/address/factory', () => ({
  getApiAddressService: vi.fn(),
}));

describe('[id] address API', () => {
  const service = {
    getAddress: vi.fn(async () => ({})),
    updateAddress: vi.fn(async () => ({})),
    deleteAddress: vi.fn(async () => {}),
  } as any;

  beforeEach(() => {
    vi.mocked(getApiAddressService).mockReturnValue(service);
    vi.clearAllMocks();
  });

  it('GET returns address', async () => {
    const req = new NextRequest('http://test');
    req.headers.set('x-user-id', 'u1');
    const res = await GET(req as any, { params: { id: '1' } });
    expect(res.status).toBe(200);
    expect(service.getAddress).toHaveBeenCalledWith('1', 'u1');
  });

  it('PUT updates address', async () => {
    const req = new NextRequest('http://test', { method: 'PUT', body: '{}' });
    req.headers.set('x-user-id', 'u1');
    (req as any).json = async () => ({ fullName: 'John' });
    const res = await PUT(req as any, { params: { id: '1' } });
    expect(res.status).toBe(200);
    expect(service.updateAddress).toHaveBeenCalled();
  });

  it('DELETE deletes address', async () => {
    const req = new NextRequest('http://test', { method: 'DELETE' });
    req.headers.set('x-user-id', 'u1');
    const res = await DELETE(req as any, { params: { id: '1' } });
    expect(res.status).toBe(204);
    expect(service.deleteAddress).toHaveBeenCalledWith('1', 'u1');
  });
});
