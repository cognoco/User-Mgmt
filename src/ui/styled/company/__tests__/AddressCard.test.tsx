import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressCard } from '@/src/ui/styled/company/AddressCard';
import { CompanyAddress } from '@/types/company';

describe('AddressCard styled component', () => {
  const address: CompanyAddress = {
    id: '1',
    company_id: 'c1',
    type: 'billing',
    street_line1: '123 Main St',
    street_line2: 'Suite 4',
    city: 'Metropolis',
    state: 'NY',
    postal_code: '12345',
    country: 'USA',
    is_primary: true,
    validated: true,
    created_at: '',
    updated_at: '',
  };

  it('renders address info and triggers callbacks', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<AddressCard address={address} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Suite 4')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Edit address'));
    expect(onEdit).toHaveBeenCalledWith(address);
    await user.click(screen.getByLabelText('Delete address'));
    expect(onDelete).toHaveBeenCalledWith(address);
  });
});
