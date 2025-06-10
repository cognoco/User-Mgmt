// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { AddressList } from '@/ui/headless/address/AddressList';
import type { Address } from '@/core/address/types';

describe('AddressList', () => {
  const addresses: Address[] = [
    { id: '1', userId: 'u1', type: 'shipping', isDefault: false, fullName: 'John', street1: '123', city: 'A', state: 'B', postalCode: '1', country: 'US', createdAt: new Date(), updatedAt: new Date() },
  ];

  it('calls handlers', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onSetDefault = vi.fn();

    render(<AddressList addresses={addresses} onEdit={onEdit} onDelete={onDelete} onSetDefault={onSetDefault} />);

    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Set Default'));
    expect(onSetDefault).toHaveBeenCalled();
  });
});
