import { OrganizationSecurityPolicy } from '@/types/organizations';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a password against the default application password requirements
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  // Default application password requirements
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a password against an organization's security policy
 */
export function validatePasswordWithPolicy(
  password: string, 
  policy: OrganizationSecurityPolicy
): PasswordValidationResult {
  const errors: string[] = [];
  
  // Check length requirement
  if (password.length <= policy.password_min_length) {
    errors.push(`Password must be at least ${policy.password_min_length} characters long`);
  }
  
  // Check uppercase requirement
  if (policy.password_require_uppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check lowercase requirement
  if (policy.password_require_lowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check number requirement
  if (policy.password_require_number && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check symbol requirement
  if (policy.password_require_symbol && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Checks if a password has been used before (for password history enforcement)
 */
export function isPasswordInHistory(
  password: string,
  passwordHistory: string[]
): boolean {
  // In a real implementation, this would check hashed passwords
  // This is a simplified version for demonstration
  return passwordHistory.includes(password);
}

/**
 * Checks if a password is expired based on organization policy
 */
export function isPasswordExpired(
  lastPasswordChangeDate: Date,
  policy: OrganizationSecurityPolicy
): boolean {
  if (policy.password_expiry_days === 0) {
    return false; // Never expires
  }
  
  const now = new Date();
  const expiryDate = new Date(lastPasswordChangeDate);
  expiryDate.setDate(expiryDate.getDate() + policy.password_expiry_days);
  
  return now > expiryDate;
} 