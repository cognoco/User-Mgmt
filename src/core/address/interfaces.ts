import { CompanyAddress, AddressCreatePayload, AddressUpdatePayload, AddressResult } from './models';

export interface AddressService {
  createAddress(companyId: string, address: AddressCreatePayload): Promise<AddressResult>;
  getAddresses(companyId: string): Promise<CompanyAddress[]>;
  updateAddress(companyId: string, addressId: string, update: AddressUpdatePayload): Promise<AddressResult>;
  deleteAddress(companyId: string, addressId: string): Promise<{ success: boolean; error?: string }>;
}
