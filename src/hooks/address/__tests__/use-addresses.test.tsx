import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAddresses } from '../use-addresses';
import { UserManagementConfiguration } from '@/core/config';
import type { AddressService } from '@/core/address/interfaces';

const mockService: AddressService = {
  getAddresses: vi.fn(async () => []),
  getAddress: vi.fn(),
  createAddress: vi.fn(async (a) => ({ ...a, id: '1', createdAt: new Date(), updatedAt: new Date() } as any)),
  updateAddress: vi.fn(async (id, updates) => ({ id, userId: 'u1', ...updates } as any)),
  deleteAddress: vi.fn(async () => {}),
  setDefaultAddress: vi.fn(async () => {}),
};

describe('useAddresses', () => {
  beforeEach(() => {
    UserManagementConfiguration.reset();
    UserManagementConfiguration.configureServiceProviders({ addressService: mockService });
    vi.clearAllMocks();
  });

  it('fetches addresses on mount', async () => {
    const { result } = renderHook(() => useAddresses());
    await act(async () => {
      await result.current.refresh();
    });
    expect(mockService.getAddresses).toHaveBeenCalled();
  });

  it('adds address', async () => {
    const { result } = renderHook(() => useAddresses());
    await act(async () => {
      await result.current.addAddress({ userId: 'u1', type: 'shipping', isDefault: false, fullName: 'John', street1: '123', city: 'A', state: 'B', postalCode: '1', country: 'US' });
    });
    expect(mockService.createAddress).toHaveBeenCalled();
    expect(result.current.addresses.length).toBe(1);
  });
});
