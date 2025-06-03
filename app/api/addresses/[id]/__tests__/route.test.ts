import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET, PUT, DELETE } from '../route';
import { getApiAddressService } from '@/services/address/factory';

vi.mock('@/services/address/factory', () => ({
  getApiAddressService: vi.fn(),
}));

vi.mock('@/middleware/with-security', () => ({
  withSecurity: vi.fn((handler: any) => handler),
}));

vi.mock('@/middleware/rate-limit', () => ({
  withRateLimit: vi.fn((req: any, handler: any) => handler(req)),
}));

vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any, req: any) => {
    // Mock successful authentication
    return handler(req, { userId: 'u1', role: 'user', permissions: [] });
  }),
}));

vi.mock('@/lib/api/common', () => ({
  createSuccessResponse: vi.fn((data) => NextResponse.json(data, { status: 200 })),
  createNoContentResponse: vi.fn(() => new NextResponse(null, { status: 204 })),
  createValidationError: vi.fn((message, details) => {
    const error = new Error(message);
    (error as any).details = details;
    (error as any).status = 400;
    return error;
  }),
  createUnauthorizedError: vi.fn(() => {
    const error = new Error('Unauthorized');
    (error as any).status = 401;
    return error;
  }),
}));

vi.mock('@/core/address/validation', () => ({
  addressSchema: {
    partial: vi.fn(() => ({
      safeParse: vi.fn((data) => {
        // Valid if data is present and postalCode is not a number
        if (data && typeof data.postalCode !== 'number') {
          return { success: true, data };
        }
        return { 
          success: false, 
          error: { 
            flatten: () => ({ fieldErrors: { postalCode: ['Invalid type'] } }) 
          }
        };
      }),
    })),
  },
}));

describe('[id] address API', () => {
  interface AddressService {
    getAddress: (id: string, userId: string) => Promise<Record<string, unknown>>;
    updateAddress: (id: string, data: Record<string, unknown>, userId: string) => Promise<Record<string, unknown>>;
    deleteAddress: (id: string, userId: string) => Promise<void>;
  }

  const service: AddressService = {
    getAddress: vi.fn(async () => ({ id: '1', fullName: 'John Doe' })),
    updateAddress: vi.fn(async (id, data) => ({ id, ...data })),
    deleteAddress: vi.fn(async () => {}),
  };

  beforeEach(() => {
    vi.mocked(getApiAddressService).mockReturnValue(service);
    vi.clearAllMocks();
  });

  it('GET returns address', async () => {
    const req = new NextRequest('http://test');
    const res = await GET(req, { params: { id: '1' } });
    expect(res.status).toBe(200);
    expect(service.getAddress).toHaveBeenCalledWith('1', 'u1');
  });

  it('PUT updates address with valid data', async () => {
    const updateData = { fullName: 'John Updated' };
    const req = new NextRequest('http://test', { method: 'PUT', body: JSON.stringify(updateData) });
    req.json = vi.fn().mockResolvedValue(updateData);
    
    const res = await PUT(req, { params: { id: '1' } });
    expect(res.status).toBe(200);
    expect(service.updateAddress).toHaveBeenCalledWith('1', updateData, 'u1');
  });

  it('PUT validates input and rejects invalid data', async () => {
    const invalidData = { postalCode: 123 }; // Should be string, not number
    const req = new NextRequest('http://test', { method: 'PUT', body: JSON.stringify(invalidData) });
    req.json = vi.fn().mockResolvedValue(invalidData);
    
    // The validation error should be thrown and handled
    await expect(PUT(req, { params: { id: '1' } })).rejects.toThrow();
  });

  it('DELETE deletes address', async () => {
    const req = new NextRequest('http://test', { method: 'DELETE' });
    const res = await DELETE(req, { params: { id: '1' } });
    expect(res.status).toBe(204);
    expect(service.deleteAddress).toHaveBeenCalledWith('1', 'u1');
  });
});
