/**
 * Auth Data Provider Interface
 * 
 * This file defines the interface for authentication data providers.
 * Following the adapter pattern, this interface abstracts the data access
 * layer for authentication operations, making the core business logic
 * database-agnostic.
 */

import { 
  AuthResult, 
  LoginPayload, 
  RegistrationPayload, 
  User,
  MFASetupResponse,
  MFAVerifyResponse
} from '../../core/auth/models';

/**
 * Auth data provider interface
 * 
 * This interface defines all authentication-related data operations.
 * Any implementation of this interface must provide all these methods.
 */
export interface AuthDataProvider {
  /**
   * Authenticate a user with email and password
   * 
   * @param credentials Login credentials including email, password and remember me option
   * @returns Authentication result with success status and user data or error
   */
  login(credentials: LoginPayload): Promise<AuthResult>;
  
  /**
   * Register a new user
   * 
   * @param userData Registration data including email, password, name, etc.
   * @returns Authentication result with success status and user data or error
   */
  register(userData: RegistrationPayload): Promise<AuthResult>;
  
  /**
   * Log out the current user
   */
  logout(): Promise<void>;
  
  /**
   * Get the currently authenticated user
   * 
   * @returns The current user or null if not authenticated
   */
  getCurrentUser(): Promise<User | null>;
  
  /**
   * Send a password reset email to the specified email address
   * 
   * @param email Email address to send the reset link to
   * @returns Result object with success status and message or error
   */
  resetPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }>;
  
  /**
   * Update the user's password
   * 
   * @param oldPassword Current password for verification
   * @param newPassword New password to set
   */
  updatePassword(oldPassword: string, newPassword: string): Promise<void>;
  
  /**
   * Send an email verification link to the specified email address
   * 
   * @param email Email address to verify
   * @returns Authentication result with success status or error
   */
  sendVerificationEmail(email: string): Promise<AuthResult>;
  
  /**
   * Verify an email address using a token
   * 
   * @param token Verification token from the email link
   */
  verifyEmail(token: string): Promise<void>;
  
  /**
   * Delete the current user's account
   * 
   * @param password Current password for verification (optional depending on implementation)
   */
  deleteAccount(password?: string): Promise<void>;
  
  /**
   * Set up Multi-Factor Authentication for the current user
   * 
   * @returns MFA setup response with secret and QR code
   */
  setupMFA(): Promise<MFASetupResponse>;
  
  /**
   * Verify a Multi-Factor Authentication code
   * 
   * @param code MFA code from authenticator app
   * @returns MFA verification response with success status and token
   */
  verifyMFA(code: string): Promise<MFAVerifyResponse>;
  
  /**
   * Disable Multi-Factor Authentication for the current user
   * 
   * @param code MFA code from authenticator app for verification
   * @returns Authentication result with success status or error
   */
  disableMFA(code: string): Promise<AuthResult>;
  
  /**
   * Refresh the authentication token
   * 
   * @returns True if token was refreshed successfully, false otherwise
   */
  refreshToken(): Promise<boolean>;
  
  /**
   * Subscribe to authentication state changes
   * 
   * @param callback Function to call when authentication state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
