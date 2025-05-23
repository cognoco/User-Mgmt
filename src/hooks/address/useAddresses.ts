import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { AddressService } from '@/core/address/interfaces';
import type { Address } from '@/core/address/types';
import { UserManagementConfiguration } from '@/core/config';

export function useAddresses() {
  const addressService = UserManagementConfiguration.getServiceProvider<AddressService>('addressService');
  if (!addressService) {
    throw new Error('AddressService is not registered in the service provider registry');
  }

  const { user } = useAuth();
  const currentUserId = user?.id || '';

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const userAddresses = await addressService.getAddresses(currentUserId);
      setAddresses(userAddresses);
    } catch (err) {
      setError('Failed to fetch addresses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [addressService, currentUserId]);

  const addAddress = async (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const newAddress = await addressService.createAddress(address);
      setAddresses(prev => [...prev, newAddress]);
    } catch (err) {
      setError('Failed to add address');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    try {
      setLoading(true);
      const updated = await addressService.updateAddress(id, updates, currentUserId);
      setAddresses(prev => prev.map(a => (a.id === id ? updated : a)));
    } catch (err) {
      setError('Failed to update address');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      setLoading(true);
      await addressService.deleteAddress(id, currentUserId);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError('Failed to delete address');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      setLoading(true);
      await addressService.setDefaultAddress(id, currentUserId);
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    } catch (err) {
      setError('Failed to set default address');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return {
    addresses,
    loading,
    error,
    refresh: fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  };
}
