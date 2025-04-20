export interface CompanyProfile {
  id: string;
  name: string;
  legal_name: string;
  registration_number?: string;
  tax_id?: string;
  website?: string;
  industry: string;
  size_range: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  founded_year: number;
  description?: string;
  status: 'pending' | 'active' | 'suspended';
  verified: boolean;
  created_at: string;
  updated_at: string;
  address?: Partial<CompanyAddress>;
  // Domain Verification Fields
  domain_name?: string | null;
  domain_verification_token?: string | null;
  domain_verified?: boolean;
  domain_last_checked?: string | null; // ISO string timestamp
}

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

export interface CompanyDocument {
  id: string;
  company_id: string;
  type: 'registration' | 'tax' | 'other';
  file_path: string;
  file_name: string;
  mime_type: string;
  size: number;
  status: 'pending' | 'verified' | 'rejected';
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  signedUrl?: string | null;
} 