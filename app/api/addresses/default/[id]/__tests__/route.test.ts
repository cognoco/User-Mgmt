import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@app/api/addresses/default/[id]/route';
import { configureServices, resetServiceContainer } from '@/lib/config/serviceContainer';
import type { AddressService } from '@/core/address/interfaces';
import type { AuthService } from '@/core/auth/interfaces';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers';

const service: AddressService = {
  setDefaultAddress: vi.fn(async () => {}),
  getAddresses: vi.fn(async () => []),
  createAddress: vi.fn(async (a: any) => a),
  getAddress: vi.fn(async () => ({})),
  updateAddress: vi.fn(async () => ({})),
  deleteAddress: vi.fn(async () => {}),
} as any;

const authService: Partial<AuthService> = {
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }),
};

beforeEach(() => {
  vi.clearAllMocks();
  resetServiceContainer();
  configureServices({
    addressService: service as AddressService,
    authService: authService as AuthService,
  });
});

describe('default address API', () => {
  it('sets default address', async () => {
    const req = createAuthenticatedRequest('POST', 'http://test/api/addresses/default/1');
    const res = await POST(req);
    expect(res.status).toBe(204);
    expect(service.setDefaultAddress).toHaveBeenCalledWith('1', 'u1');
  });
});
