import { CompanyAddress, AddressCreatePayload, AddressUpdatePayload, AddressResult } from '../../core/address/models';

export interface AddressDataProvider {
  createAddress(companyId: string, address: AddressCreatePayload): Promise<AddressResult>;
  getAddresses(companyId: string): Promise<CompanyAddress[]>;
  updateAddress(companyId: string, addressId: string, update: AddressUpdatePayload): Promise<AddressResult>;
  deleteAddress(companyId: string, addressId: string): Promise<{ success: boolean; error?: string }>;
}
