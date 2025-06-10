import type { Address } from '@/core/address/types';
import React from 'react';

interface AddressSelectorProps {
  addresses: Address[];
  selectedId?: string;
  onSelect: (address: Address) => void;
  onCreateNew: () => void;
}

export function AddressSelector({ addresses, selectedId, onSelect, onCreateNew }: AddressSelectorProps) {
  return (
    <div>
      <select value={selectedId} onChange={e => {
        const id = e.target.value;
        const address = addresses.find(a => a.id === id);
        if (address) onSelect(address);
      }}>
        <option value="">Select address</option>
        {addresses.map(addr => (
          <option key={addr.id} value={addr.id}>{addr.fullName}</option>
        ))}
      </select>
      <button type="button" onClick={onCreateNew}>Add New</button>
    </div>
  );
}
