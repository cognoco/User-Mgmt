import { z } from 'zod';

// Validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(1, 'Password is required');

// Types
export interface User {
  id: string; // Supabase user ID is typically a string (UUID)
  email: string;
  // isVerified is not directly on the user object, often checked via metadata or session
  // We might store first/last name here if fetched separately, or rely on metadata
  firstName?: string; 
  lastName?: string;
  // createdAt/updatedAt might be available depending on how we fetch/store user data
  createdAt?: string;
  updatedAt?: string;
  // Add other relevant fields from Supabase user object if needed
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>; 
  role?: string;
  metadata?: Record<string, any>;
  mfaEnabled?: boolean; // Added for MFA status
}

// Define the payload structure for the registration API call
export interface RegistrationPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  metadata?: Record<string, any>;
  // Add other fields if needed, e.g., userType for business registration later
}

// Add type for Login payload (including rememberMe)
export interface LoginPayload {
    email: string;
    password: string;
    rememberMe?: boolean;
}

// Add type for Login function result
export interface AuthResult {
    success: boolean;
    error?: string;
    code?: 'EMAIL_NOT_VERIFIED' | 'INVALID_CREDENTIALS' | 'RATE_LIMIT_EXCEEDED' | 'MFA_REQUIRED';
    requiresMfa?: boolean;
    token?: string;
    retryAfter?: number;
    remainingAttempts?: number;
}

// Validation schemas for forms
export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.string().email(), // Use stricter email check
  password: z.string().min(8), // Keep stricter password check for registration form
  confirmPassword: z.string(),
  firstName: z.string().min(1), // Define here if needed by form schema directly
  lastName: z.string().min(1),
  acceptTerms: z.boolean().refine(val => val === true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Infer types from schemas
export type LoginData = z.infer<typeof loginSchema>; // Now includes rememberMe
export type RegisterData = z.infer<typeof registerSchema>; 

// Store types
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  successMessage: string | null; 
  rateLimitInfo: RateLimitInfo | null;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  mfaQrCode: string | null;
  mfaBackupCodes: string[] | null;
  login: (data: LoginPayload) => Promise<AuthResult>; 
  register: (data: RegistrationPayload) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>; // Consider returning status
  sendVerificationEmail: (email: string) => Promise<AuthResult>;
  verifyEmail: (token: string) => Promise<void>; // Consider returning status
  clearError: () => void;
  clearSuccessMessage: () => void; 
  deleteAccount: (password?: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setupMFA: () => Promise<MFASetupResponse>;
  verifyMFA: (code: string) => Promise<MFAVerifyResponse>;
  disableMFA: (code: string) => Promise<AuthResult>;
  handleSessionTimeout: () => void;
  refreshToken: () => Promise<boolean>;
  setLoading: (isLoading: boolean) => void;
} 

export interface RateLimitInfo {
  retryAfter?: number;
  remainingAttempts?: number;
  windowMs: number;
} 

export interface MFASetupResponse {
  success: boolean;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[]; // Added for backup codes
  error?: string;
}

export interface MFAVerifyResponse {
  success: boolean;
  backupCodes?: string[];
  token?: string; // Added for post-verification token
  error?: string;
} 