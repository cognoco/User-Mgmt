import { z } from 'zod';

export const addressSchema = z.object({
  type: z.enum(['billing', 'shipping', 'both']),
  fullName: z.string().min(1, 'Full name is required'),
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
  company: z.string().optional(),
  userId: z.string().optional(),
});
