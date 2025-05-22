import type { Address } from '@/core/address/types';
import React, { useState } from 'react';

export interface AddressFormProps {
  initialValues?: Partial<Address>;
  onSubmit: (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  renderField?: (field: {
    name: keyof Address;
    value: string;
    onChange: (v: string) => void;
    label: string;
    error?: string;
  }) => React.ReactNode;
}

export function AddressForm({ initialValues = {}, onSubmit, onCancel, loading, renderField }: AddressFormProps) {
  const [values, setValues] = useState<Omit<Address, 'id' | 'createdAt' | 'updatedAt'>>({
    userId: initialValues.userId || '',
    type: initialValues.type || 'shipping',
    isDefault: initialValues.isDefault ?? false,
    fullName: initialValues.fullName || '',
    company: initialValues.company,
    street1: initialValues.street1 || '',
    street2: initialValues.street2,
    city: initialValues.city || '',
    state: initialValues.state || '',
    postalCode: initialValues.postalCode || '',
    country: initialValues.country || '',
    phone: initialValues.phone
  });

  const handleChange = (name: keyof Address, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(values);
  };

  const field = (name: keyof Address, label: string) => {
    const value = (values as any)[name] as string;
    const onChange = (v: string) => handleChange(name, v);
    return renderField ? renderField({ name, value, onChange, label }) : (
      <div>
        <label>{label}</label>
        <input value={value} onChange={e => onChange(e.target.value)} />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {field('fullName', 'Full Name')}
      {field('street1', 'Street Address 1')}
      {field('street2', 'Street Address 2')}
      {field('city', 'City')}
      {field('state', 'State')}
      {field('postalCode', 'Postal Code')}
      {field('country', 'Country')}
      {field('phone', 'Phone')}
      <div>
        <button type="submit" disabled={loading}>Submit</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
