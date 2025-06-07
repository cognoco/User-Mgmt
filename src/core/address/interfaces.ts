import {
  CompanyAddress,
  AddressCreatePayload,
  AddressUpdatePayload,
  AddressResult,
} from "@/src/core/address/models";
import type { Address } from "@/src/core/address/types";

/**
 * Service for managing company level addresses.
 *
 * All write operations resolve with an {@link AddressResult} describing success
 * or failure. Implementations should only reject the promise for unexpected
 * errors such as network issues.
 */
export interface CompanyAddressService {
  /** Create an address for the given company */
  createAddress(
    companyId: string,
    address: AddressCreatePayload,
  ): Promise<AddressResult>;

  /** Retrieve all addresses associated with the company */
  getAddresses(companyId: string): Promise<CompanyAddress[]>;

  /** Update a specific company address */
  updateAddress(
    companyId: string,
    addressId: string,
    update: AddressUpdatePayload,
  ): Promise<AddressResult>;

  /** Remove a company address */
  deleteAddress(
    companyId: string,
    addressId: string,
  ): Promise<{ success: boolean; error?: string }>;
}

/**
 * Service for managing a user's personal addresses.
 *
 * These methods resolve with the resulting address objects and should throw
 * only for unexpected failures. Validation or business errors should be
 * surfaced via returned objects where applicable.
 */
export interface AddressService {
  /** Retrieve all addresses belonging to the user */
  getAddresses(userId: string): Promise<Address[]>;

  /** Get a single address by id */
  getAddress(id: string, userId: string): Promise<Address>;

  /** Create a new personal address */
  createAddress(
    address: Omit<Address, "id" | "createdAt" | "updatedAt">,
  ): Promise<Address>;

  /** Update an existing address */
  updateAddress(
    id: string,
    updates: Partial<Address>,
    userId: string,
  ): Promise<Address>;

  /** Delete an address */
  deleteAddress(id: string, userId: string): Promise<void>;

  /** Mark an address as the user's default */
  setDefaultAddress(id: string, userId: string): Promise<void>;
}
