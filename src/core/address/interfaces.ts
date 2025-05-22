import { CompanyAddress, AddressCreatePayload, AddressUpdatePayload, AddressResult } from './models';
import type { Address } from './types';

export interface CompanyAddressService {
  createAddress(companyId: string, address: AddressCreatePayload): Promise<AddressResult>;
  getAddresses(companyId: string): Promise<CompanyAddress[]>;
  updateAddress(companyId: string, addressId: string, update: AddressUpdatePayload): Promise<AddressResult>;
  deleteAddress(companyId: string, addressId: string): Promise<{ success: boolean; error?: string }>;
}

export interface AddressService {
  getAddresses(userId: string): Promise<Address[]>;
  getAddress(id: string, userId: string): Promise<Address>;
  createAddress(address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<Address>;
  updateAddress(id: string, updates: Partial<Address>, userId: string): Promise<Address>;
  deleteAddress(id: string, userId: string): Promise<void>;
  setDefaultAddress(id: string, userId: string): Promise<void>;
}
