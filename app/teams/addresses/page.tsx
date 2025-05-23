'use client';
import { useState } from 'react';
import type { Address } from '@/core/address/types';
import { useAddresses } from '@/hooks/address/useAddresses';
import { StyledAddressForm as AddressForm } from '@/ui/styled/address/AddressForm';
import { StyledAddressList as AddressList } from '@/ui/styled/address/AddressList';

export default function TeamAddressesPage() {
  const { addresses, loading, error, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
  const [editing, setEditing] = useState<Address | null>(null);

  const handleSubmit = async (data: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing) {
      await updateAddress(editing.id, data);
      setEditing(null);
    } else {
      await addAddress(data);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold">Team Addresses</h1>
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Address' : 'Add New Address'}</h2>
        <AddressForm onSubmit={handleSubmit} onCancel={() => setEditing(null)} initialValues={editing || undefined} loading={loading} />
        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
      </div>
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
        <AddressList
          addresses={addresses}
          loading={loading}
          onEdit={(addr) => setEditing(addr)}
          onDelete={deleteAddress}
          onSetDefault={setDefaultAddress}
        />
      </div>
    </div>
  );
}
