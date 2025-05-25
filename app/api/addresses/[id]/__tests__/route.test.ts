import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../route';
import { getApiAddressService } from '@/services/address/factory';

vi.mock('@/services/address/factory', () => ({
  getApiAddressService: vi.fn(),
}));

describe('[id] address API', () => {
  interface AddressService {
    getAddress: (id: string, userId: string) => Promise<Record<string, unknown>>;
    updateAddress: (id: string, data: Record<string, unknown>, userId: string) => Promise<Record<string, unknown>>;
    deleteAddress: (id: string, userId: string) => Promise<void>;
  }

  const service: AddressService = {
    getAddress: vi.fn(async () => ({})),
    updateAddress: vi.fn(async () => ({})),
    deleteAddress: vi.fn(async () => {}),
  };

  beforeEach(() => {
    vi.mocked(getApiAddressService).mockReturnValue(service);
    vi.clearAllMocks();
  });

  it('GET returns address', async () => {
    const req = new NextRequest('http://test');
    req.headers.set('x-user-id', 'u1');
    const res = await GET(req as unknown as NextRequest, { params: { id: '1' } });
    expect(res.status).toBe(200);
    expect(service.getAddress).toHaveBeenCalledWith('1', 'u1');
  });

  it('PUT updates address', async () => {
    const req = new NextRequest('http://test', { method: 'PUT', body: '{}' });
    req.headers.set('x-user-id', 'u1');
    (req as unknown as { json: () => Promise<{ fullName: string }> }).json = async () => ({ fullName: 'John' });
    const res = await PUT(req as unknown as NextRequest, { params: { id: '1' } });
    expect(res.status).toBe(200);
    expect(service.updateAddress).toHaveBeenCalled();
  });

  it('DELETE deletes address', async () => {
    const req = new NextRequest('http://test', { method: 'DELETE' });
    req.headers.set('x-user-id', 'u1');
    const res = await DELETE(req as unknown as NextRequest, { params: { id: '1' } });
    expect(res.status).toBe(204);
    expect(service.deleteAddress).toHaveBeenCalledWith('1', 'u1');
  });
});
