/**
 * Address Data Provider Interface
 *
 * Defines the contract for persistence operations related to company addresses.
 * Implementations should provide database-specific logic while adhering to this
 * interface so the service layer can remain database agnostic.
 */
import type {
  CompanyAddress,
  AddressCreatePayload,
  AddressUpdatePayload,
  AddressResult
} from './models';

/**
 * Interface describing low level address data operations.
 * All methods return domain models and results without any business logic.
 */
export interface IAddressDataProvider {
  /**
   * Create a new address for the specified company.
   *
   * @param companyId - ID of the company that owns the address
   * @param address - Address details to create
   * @returns Result object with success status and created address or error
   */
  createAddress(
    companyId: string,
    address: AddressCreatePayload
  ): Promise<AddressResult>;

  /**
   * Retrieve all addresses belonging to a company.
   *
   * @param companyId - ID of the company
   * @returns Array of company addresses
   */
  getAddresses(companyId: string): Promise<CompanyAddress[]>;

  /**
   * Update an existing address for a company.
   *
   * @param companyId - ID of the company
   * @param addressId - ID of the address to update
   * @param update - Partial address data to update
   * @returns Result object with success status and updated address or error
   */
  updateAddress(
    companyId: string,
    addressId: string,
    update: AddressUpdatePayload
  ): Promise<AddressResult>;

  /**
   * Delete an address owned by a company.
   *
   * @param companyId - ID of the company
   * @param addressId - ID of the address to delete
   * @returns Object indicating whether the deletion succeeded and optional error
   */
  deleteAddress(
    companyId: string,
    addressId: string
  ): Promise<{ success: boolean; error?: string }>;
}
