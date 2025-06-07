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
  AddressQuery,
} from '@/src/core/address/models';

export interface IAddressDataProvider {
  /**
   * Create a new address for the given company.
   *
   * @param companyId - Owning company id
   * @param address - Data for the new address
   * @returns Result object with the created address or error information
   */
  createAddress(
    companyId: string,
    address: AddressCreatePayload,
  ): Promise<AddressResult>;

  /**
   * Retrieve a single company address by id.
   *
   * @param companyId - Owning company id
   * @param addressId - Identifier of the address
   * @returns The address or null if not found
   */
  getAddress(
    companyId: string,
    addressId: string,
  ): Promise<CompanyAddress | null>;

  /**
   * Retrieve addresses for a company using optional query filters.
   *
   * @param companyId - Owning company id
   * @param query - Pagination, sorting and filtering options
   * @returns A list of matching addresses and total count
   */
  getAddresses(
    companyId: string,
    query?: AddressQuery,
  ): Promise<{ addresses: CompanyAddress[]; count: number }>;

  /**
   * Update an existing company address.
   *
   * @param companyId - Owning company id
   * @param addressId - Identifier of the address to update
   * @param update - Partial address fields to apply
   */
  updateAddress(
    companyId: string,
    addressId: string,
    update: AddressUpdatePayload,
  ): Promise<AddressResult>;

  /**
   * Remove a company address permanently.
   *
   * @param companyId - Owning company id
   * @param addressId - Identifier of the address to delete
   */
  deleteAddress(
    companyId: string,
    addressId: string,
  ): Promise<{ success: boolean; error?: string }>;
}
