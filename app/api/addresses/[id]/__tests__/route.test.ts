import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from '@app/api/addresses/[id]/route';
import { configureServices, resetServiceContainer } from '@/lib/config/serviceContainer';
import type { AddressService } from '@/core/address/interfaces';
import type { AuthService } from '@/core/auth/interfaces';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers';

const service: AddressService = {
  getAddress: vi.fn(async () => ({ id: '1', fullName: 'John Doe' })),
  updateAddress: vi.fn(async (id, data) => ({ id, ...data })),
  deleteAddress: vi.fn(async () => {}),
  getAddresses: vi.fn(async () => []),
  createAddress: vi.fn(async (a: any) => a),
  setDefaultAddress: vi.fn(async () => {}),
} as any;

const authService: Partial<AuthService> = {
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }),
};

beforeEach(() => {
  vi.clearAllMocks();
  resetServiceContainer();
  configureServices({
    personalAddressService: service as AddressService,
    authService: authService as AuthService,
  });
});

describe('[id] address API', () => {
  it('GET returns address', async () => {
    const req = createAuthenticatedRequest('GET', 'http://test/api/addresses/1');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(service.getAddress).toHaveBeenCalledWith('1', 'u1');
  });

  it('PUT updates address with valid data', async () => {
    const updateData = { fullName: 'John Updated' };
    const req = createAuthenticatedRequest('PUT', 'http://test/api/addresses/1', updateData);
    (req as any).json = vi.fn().mockResolvedValue(updateData);
    const res = await PUT(req);
    expect(res.status).toBe(200);
    expect(service.updateAddress).toHaveBeenCalledWith('1', updateData, 'u1');
  });

  it('PUT validates input and rejects invalid data', async () => {
    const invalidData = { postalCode: 123 };
    const req = createAuthenticatedRequest('PUT', 'http://test/api/addresses/1', invalidData);
    (req as any).json = vi.fn().mockResolvedValue(invalidData);
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it('DELETE deletes address', async () => {
    const req = createAuthenticatedRequest('DELETE', 'http://test/api/addresses/1');
    const res = await DELETE(req);
    expect(res.status).toBe(204);
    expect(service.deleteAddress).toHaveBeenCalledWith('1', 'u1');
  });
});
