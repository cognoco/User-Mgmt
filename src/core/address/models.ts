import { z } from 'zod';

export type AddressType = 'billing' | 'shipping' | 'legal';

export interface CompanyAddress {
  id: string;
  company_id: string;
  type: AddressType;
  street_line1: string;
  street_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
  validated: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressCreatePayload {
  type: AddressType;
  street_line1: string;
  street_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_primary?: boolean;
  validated?: boolean;
}

export interface AddressUpdatePayload {
  type?: AddressType;
  street_line1?: string;
  street_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  is_primary?: boolean;
  validated?: boolean;
}

export interface AddressResult {
  success: boolean;
  address?: CompanyAddress;
  error?: string;
}

export interface AddressQuery {
  /** Page number starting from 1 */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Filter by address type */
  type?: AddressType;
  /** Only return addresses marked as primary */
  is_primary?: boolean;
  /** Filter by validation status */
  validated?: boolean;
  /** Field to sort by */
  sortBy?: keyof CompanyAddress | string;
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

export const addressCreateSchema = z.object({
  type: z.enum(['billing', 'shipping', 'legal']),
  street_line1: z.string().min(1).max(100),
  street_line2: z.string().max(100).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100).optional(),
  postal_code: z.string().min(1).max(20),
  country: z.string().min(2).max(2),
  is_primary: z.boolean().optional(),
  validated: z.boolean().optional()
});
export type AddressCreateData = z.infer<typeof addressCreateSchema>;

export const addressUpdateSchema = addressCreateSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});
export type AddressUpdateData = z.infer<typeof addressUpdateSchema>;
