/**
 * Address Data Provider Interface
 *
 * Defines the contract for persistence operations related to company addresses.
 * Implementations should contain data access logic only.
 */
import type {
  CompanyAddress,
  AddressCreatePayload,
  AddressUpdatePayload,
  AddressResult,
} from './models';

export interface IAddressDataProvider {
  /** Create an address for the given company */
  createAddress(
    companyId: string,
    address: AddressCreatePayload,
  ): Promise<AddressResult>;

  /** Retrieve all addresses for the company */
  getAddresses(companyId: string): Promise<CompanyAddress[]>;

  /** Update a company address */
  updateAddress(
    companyId: string,
    addressId: string,
    update: AddressUpdatePayload,
  ): Promise<AddressResult>;

  /** Delete a company address */
  deleteAddress(
    companyId: string,
    addressId: string,
  ): Promise<{ success: boolean; error?: string }>;
}
