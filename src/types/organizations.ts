export interface OrganizationSecurityPolicy {
  // Session Management
  session_timeout_mins: number;
  max_sessions_per_user: number;
  
  // MFA Settings
  require_mfa: boolean;
  allowed_mfa_methods: string[]; // e.g., ["totp", "sms", "email"]
  
  // Password Complexity
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_number: boolean;
  password_require_symbol: boolean;
  
  // Password Rotation/Expiry
  password_expiry_days: number; // 0 means never expire
  password_history_count: number; // How many previous passwords to remember
  
  // IP Restrictions
  ip_allowlist_enabled: boolean;
  ip_allowlist: string[]; // List of allowed IP addresses/ranges
  ip_denylist: string[]; // List of denied IP addresses/ranges
  
  // Sensitive Actions
  require_reauth_for_sensitive: boolean;
  sensitive_actions: string[]; // List of actions requiring reauth
  reauth_timeout_mins: number; // How long reauth is valid
}

export const DEFAULT_SECURITY_POLICY: OrganizationSecurityPolicy = {
  // Session Management
  session_timeout_mins: 60, // 1 hour default
  max_sessions_per_user: 5,
  
  // MFA Settings
  require_mfa: false,
  allowed_mfa_methods: ["totp", "sms", "email"],
  
  // Password Complexity
  password_min_length: 8,
  password_require_uppercase: true,
  password_require_lowercase: true,
  password_require_number: true,
  password_require_symbol: false,
  
  // Password Rotation/Expiry
  password_expiry_days: 0, // Never expire by default
  password_history_count: 3,
  
  // IP Restrictions
  ip_allowlist_enabled: false,
  ip_allowlist: [],
  ip_denylist: [],
  
  // Sensitive Actions
  require_reauth_for_sensitive: false,
  sensitive_actions: ["delete_account", "change_role", "export_data"],
  reauth_timeout_mins: 15
}; 