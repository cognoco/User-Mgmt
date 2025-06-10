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
  // New fields for multiple domains
  domains?: CompanyDomain[];
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

// New type for company domains
export interface CompanyDomain {
  id: string;
  company_id: string;
  domain: string;
  is_primary: boolean;
  verification_token?: string | null;
  is_verified: boolean;
  verification_method: 'dns_txt' | string;
  verification_date?: string | null; // ISO string timestamp
  last_checked?: string | null; // ISO string timestamp
  created_at: string;
  updated_at: string;
}

// Notification types
export type NotificationType = 'new_member_domain' | 'domain_verified' | 'domain_verification_failed' | 'security_alert' | 'sso_event';
export type NotificationChannel = 'email' | 'in_app' | 'both';

// Company notification preferences
export interface CompanyNotificationPreference {
  id: string;
  company_id: string;
  notification_type: NotificationType;
  enabled: boolean;
  channel: NotificationChannel;
  created_at: string;
  updated_at: string;
  recipients?: CompanyNotificationRecipient[];
}

// Company notification recipients
export interface CompanyNotificationRecipient {
  id: string;
  preference_id: string;
  user_id?: string;
  email?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Company notification logs
export interface CompanyNotificationLog {
  id: string;
  preference_id?: string;
  recipient_id?: string;
  notification_type: NotificationType;
  channel: NotificationChannel;
  content: any; // JSONB content
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  error_message?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
} 