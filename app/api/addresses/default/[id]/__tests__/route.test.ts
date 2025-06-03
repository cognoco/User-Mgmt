import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '../route';
import { getApiPersonalAddressService } from '@/services/address/factory';

vi.mock('@/services/address/factory', () => ({
  getApiAddressService: vi.fn(),
  getApiPersonalAddressService: vi.fn(),
}));

vi.mock('@/middleware/with-security', () => ({
  withSecurity: vi.fn((handler: any) => {
    return (req: NextRequest) => {
      // Call the handler with the request
      return handler(req);
    };
  }),
}));

vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any, req: any) => {
    // Mock successful authentication
    return handler(req, { userId: 'u1', role: 'user', permissions: [] });
  }),
}));

vi.mock('@/lib/api/common', () => ({
  createNoContentResponse: vi.fn(() => new NextResponse(null, { status: 204 })),
}));

describe('default address API', () => {
  const service = { 
    setDefaultAddress: vi.fn(async () => {}),
    // Add other required methods to avoid type errors
    getAddresses: vi.fn(async () => []),
    createAddress: vi.fn(async (a: any) => a),
    getAddress: vi.fn(async () => ({})),
    updateAddress: vi.fn(async () => ({})),
    deleteAddress: vi.fn(async () => {}),
  } as any;

  beforeEach(() => {
    vi.mocked(getApiPersonalAddressService).mockReturnValue(service);
    vi.clearAllMocks();
  });

  it('sets default address', async () => {
    const req = new NextRequest('http://test', { method: 'POST' });
    const res = await POST(req, { params: { id: '1' } });
    expect(res.status).toBe(204);
    expect(service.setDefaultAddress).toHaveBeenCalledWith('1', 'u1');
  });
});
