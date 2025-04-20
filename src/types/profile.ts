import { z } from 'zod';

// Profile validation schemas (make reusable)
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long');
export const bioSchema = z.string().max(500, 'Bio must be less than 500 characters').optional().nullable();
export const locationSchema = z.string().max(100, 'Location too long').optional().nullable();
export const websiteSchema = z.string().url('Invalid URL format').max(200, 'Website URL too long').optional().or(z.literal('')).nullable();
export const phoneSchema = z.string().max(30, 'Phone number too long').optional().nullable(); // Basic validation
export const addressSchema = z.string().max(200, 'Address too long').optional().nullable();
export const citySchema = z.string().max(100, 'City too long').optional().nullable();
export const stateSchema = z.string().max(100, 'State/Province too long').optional().nullable();
export const countrySchema = z.string().max(100, 'Country too long').optional().nullable();
export const postalCodeSchema = z.string().max(20, 'Postal code too long').optional().nullable();


// Profile types - Reflecting DB schema accurately
export interface Profile {
  id: string; // This is the user_id from auth.users
  // userId?: string; // Usually the same as id, potentially remove if redundant
  first_name?: string | null;
  last_name?: string | null; 
  avatar_url?: string | null;
  bio?: string | null;
  date_of_birth?: string | null; // Represent date as string or Date
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  phone_number?: string | null;
  is_active?: boolean | null; 
  is_public?: boolean | null; // Add is_public if added to DB
  created_at?: string | null;
  updated_at?: string | null; // Renamed from updatedAt for consistency
  // Add other fields if they exist (e.g., website?)
  website?: string | null; // Assuming website is stored here too

  // --- Added Settings Fields ---
  theme?: 'light' | 'dark' | 'system' | null;
  language?: string | null; // Use string, specific codes handled elsewhere
  email_notifications?: boolean | null;
  push_notifications?: boolean | null;
  // Add any other relevant settings fields from DB
}

// Profile form schema - For validating data usually updated via a form
export const profileSchema = z.object({
  // firstName: nameSchema, // Assuming names might be separate or handled differently
  // lastName: nameSchema,
  bio: bioSchema,
  // date_of_birth: z.date().optional().nullable(), // Use appropriate Zod type if handling Date objects
  gender: z.string().max(50).optional().nullable(),
  address: addressSchema,
  city: citySchema,
  state: stateSchema,
  country: countrySchema,
  postal_code: postalCodeSchema,
  phone_number: phoneSchema,
  website: websiteSchema,
  // Note: Settings fields like theme, language, notifications, is_public 
  // are not validated by this specific schema, as they might be updated
  // individually elsewhere (like in SettingsPage or ProfileForm privacy toggle).
  // The updateProfile function accepts Partial<Profile> to allow updating them.
});

// Infer type from schema for specific form data shapes
export type ProfileFormData = z.infer<typeof profileSchema>;

// Profile store types
export interface ProfileState {
  profile: Profile | null; // Use the updated Profile interface
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  // updateProfile now accepts Partial<Profile> to allow updating settings too
  updateProfile: (data: Partial<Profile>) => Promise<void>; 
  // uploadAvatar might accept File or base64 string
  uploadAvatar: (fileOrBase64: File | string) => Promise<string | null>; 
  removeAvatar: () => Promise<boolean>;
  clearError: () => void;
} 