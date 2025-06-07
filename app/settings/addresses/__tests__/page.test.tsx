import '@/tests/i18nTestSetup';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/hooks/address/useAddresses', () => ({
  useAddresses: () => ({
    addresses: [
      { id: '1', userId: 'u1', type: 'shipping', isDefault: true, fullName: 'John Doe', street1: '123 Main', city: 'City', state: 'ST', postalCode: '12345', country: 'US', createdAt: new Date(), updatedAt: new Date() },
    ],
    loading: false,
    error: null,
    refresh: vi.fn(),
    addAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
    setDefaultAddress: vi.fn(),
  })
}));

import AddressManagementPage from '@app/settings/addresses/page';

describe('AddressManagementPage', () => {
  it('renders address list', () => {
    render(<AddressManagementPage />);
    expect(screen.getByText('Address Management')).toBeInTheDocument();
    expect(screen.getByText('Saved Addresses')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
