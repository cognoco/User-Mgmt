import type { Address } from '@/core/address/types';
import React from 'react';

export interface AddressListProps {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  loading?: boolean;
  renderItem?: (
    address: Address,
    actions: { onEdit: (address: Address) => void; onDelete: (id: string) => void; onSetDefault: (id: string) => void }
  ) => React.ReactNode;
}

export function AddressList({ addresses, onEdit, onDelete, onSetDefault, loading, renderItem }: AddressListProps) {
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {addresses.map(addr => (
        <div key={addr.id}>
          {renderItem ? (
            renderItem(addr, { onEdit, onDelete, onSetDefault })
          ) : (
            <div>
              <p>{addr.fullName}</p>
              <button onClick={() => onEdit(addr)}>Edit</button>
              <button onClick={() => onDelete(addr.id)}>Delete</button>
              {!addr.isDefault && (
                <button onClick={() => onSetDefault(addr.id)}>Set Default</button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
