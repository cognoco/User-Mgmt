/**
 * Authentication Domain Models
 * 
 * This file defines the core entity models for the authentication domain.
 * These models represent the domain objects that are used by the authentication service.
 */

import { z } from 'zod';

/**
 * User entity representing an authenticated user
 */
export interface User {
  /**
   * Unique identifier for the user
   */
  id: string;
  
  /**
   * User's email address
   */
  email: string;
  
  /**
   * User's first name (optional)
   */
  firstName?: string;
  
  /**
   * User's last name (optional)
   */
  lastName?: string;
  
  /**
   * Timestamp when the user was created
   */
  createdAt?: string;
  
  /**
   * Timestamp when the user was last updated
   */
  updatedAt?: string;
  
  /**
   * Application metadata (controlled by the application)
   */
  app_metadata?: Record<string, any>;
  
  /**
   * User metadata (can be modified by the user)
   */
  user_metadata?: Record<string, any>;
  
  /**
   * User's role
   */
  role?: string;
  
  /**
   * Generic metadata
   */
  metadata?: Record<string, any>;
  
  /**
   * Whether MFA is enabled for this user
   */
  mfaEnabled?: boolean;
}

/**
 * Login credentials payload
 */
export interface LoginPayload {
  /**
   * User's email address
   */
  email: string;
  
  /**
   * User's password
   */
  password: string;
  
  /**
   * Whether to remember the user's session
   */
  rememberMe?: boolean;
}

/**
 * Registration payload for creating a new user
 */
export interface RegistrationPayload {
  /**
   * User's email address
   */
  email: string;
  
  /**
   * User's password
   */
  password: string;
  
  /**
   * User's first name
   */
  firstName: string;
  
  /**
   * User's last name
   */
  lastName: string;
  
  /**
   * Additional metadata for the user
   */
  metadata?: Record<string, any>;
}

/**
 * Result of an authentication operation
 */
export interface AuthResult {
  /**
   * Whether the operation was successful
   */
  success: boolean;
  
  /**
   * Error message if the operation failed
   */
  error?: string;
  
  /**
   * Error code for specific error handling
   */
  code?: 'EMAIL_NOT_VERIFIED' | 'INVALID_CREDENTIALS' | 'RATE_LIMIT_EXCEEDED' | 'MFA_REQUIRED';
  
  /**
   * Whether MFA is required to complete authentication
   */
  requiresMfa?: boolean;
  
  /**
   * Authentication token if the operation was successful
   */
  token?: string;
  
  /**
   * Time in seconds to wait before retrying (for rate limiting)
   */
  retryAfter?: number;
  
  /**
   * Number of attempts remaining (for rate limiting)
   */
  remainingAttempts?: number;
  
  /**
   * User object if authentication was successful
   */
  user?: User;
  
  /**
   * Token expiration timestamp
   */
  expiresAt?: number;
  
  /**
   * Whether email confirmation is required
   */
  requiresEmailConfirmation?: boolean;
}

/**
 * Rate limiting information
 */
export interface RateLimitInfo {
  /**
   * Time in milliseconds to wait before retrying
   */
  retryAfter?: number;
  
  /**
   * Number of attempts remaining
   */
  remainingAttempts?: number;
  
  /**
   * Time window in milliseconds for rate limiting
   */
  windowMs: number;
}

/**
 * Response from MFA setup operation
 */
export interface MFASetupResponse {
  /**
   * Whether the operation was successful
   */
  success: boolean;
  
  /**
   * MFA secret key
   */
  secret?: string;
  
  /**
   * QR code for scanning with authenticator app
   */
  qrCode?: string;
  
  /**
   * Backup codes for account recovery
   */
  backupCodes?: string[];
  
  /**
   * Error message if the operation failed
   */
  error?: string;
}

/**
 * Response from MFA verification operation
 */
export interface MFAVerifyResponse {
  /**
   * Whether the operation was successful
   */
  success: boolean;
  
  /**
   * Backup codes for account recovery
   */
  backupCodes?: string[];
  
  /**
   * Authentication token if verification was successful
   */
  token?: string;
  
  /**
   * Error message if the operation failed
   */
  error?: string;
}

// Validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(1, 'Password is required');

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  acceptTerms: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type inference from schemas
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Password reset token model
export interface PasswordResetToken {
  token: string;
  userId: string;
  expiresAt: number;
}
