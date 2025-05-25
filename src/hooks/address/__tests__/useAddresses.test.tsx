import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAddresses } from '../useAddresses';
import { UserManagementConfiguration } from '@/core/config';
import type { AddressService } from '@/core/address/interfaces';
import { TestWrapper } from '../../../tests/utils/test-wrapper';
import { useAuth } from '@/hooks/auth/useAuth';

const mockService: AddressService = {
  getAddresses: vi.fn(async () => []),
  getAddress: vi.fn(),
  createAddress: vi.fn(async (a) => ({ ...a, id: '1', createdAt: new Date(), updatedAt: new Date() } as any)),
  updateAddress: vi.fn(async (id, updates) => ({ id, userId: 'u1', ...updates } as any)),
  deleteAddress: vi.fn(async () => {}),
  setDefaultAddress: vi.fn(async () => {}),
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TestWrapper authenticated customServices={{ addressService: mockService }}>
    {children}
  </TestWrapper>
);

describe('useAddresses', () => {
  beforeEach(() => {
    UserManagementConfiguration.reset();
    UserManagementConfiguration.configureServiceProviders({ addressService: mockService });
    vi.clearAllMocks();
    (useAuth as any).getState().user = { id: 'u1' };
    (useAuth as any).getState().isAuthenticated = true;
  });

  it('fetches addresses on mount', async () => {
    const { result } = renderHook(() => useAddresses(), { wrapper });
    await act(async () => {
      await result.current.refresh();
    });
    expect(mockService.getAddresses).toHaveBeenCalled();
  });

  it('adds address', async () => {
    const { result } = renderHook(() => useAddresses(), { wrapper });
    await act(async () => {
      await result.current.addAddress({ userId: 'u1', type: 'shipping', isDefault: false, fullName: 'John', street1: '123', city: 'A', state: 'B', postalCode: '1', country: 'US' });
    });
    expect(mockService.createAddress).toHaveBeenCalled();
    expect(result.current.addresses.length).toBe(1);
  });
});
