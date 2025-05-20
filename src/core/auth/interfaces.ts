/**
 * Authentication Service Interface
 * 
 * This file defines the core interfaces for the authentication domain.
 * Following the interface-first design principle, these interfaces define
 * the contract that any implementation must fulfill.
 */

import { 
  AuthResult, 
  LoginPayload, 
  RegistrationPayload, 
  User,
  MFASetupResponse,
  MFAVerifyResponse
} from './models';

/**
 * Core authentication service interface
 * 
 * This interface defines all authentication-related operations that can be performed.
 * Any implementation of this interface must provide all these methods.
 */
export interface AuthService {
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
  getCurrentUser(): User | null;
  
  /**
   * Check if a user is currently authenticated
   * 
   * @returns True if a user is authenticated, false otherwise
   */
  isAuthenticated(): boolean;
  
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
   * Handle session timeout by logging out the user
   */
  handleSessionTimeout(): void;
  
  /**
   * Subscribe to authentication state changes
   * 
   * @param callback Function to call when authentication state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}

/**
 * Authentication state interface
 * 
 * This interface defines the authentication state that can be observed.
 */
export interface AuthState {
  /**
   * Current user or null if not authenticated
   */
  user: User | null;
  
  /**
   * Authentication token or null if not authenticated
   */
  token: string | null;
  
  /**
   * True if authentication operations are in progress
   */
  isLoading: boolean;
  
  /**
   * True if a user is authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * Error message if an authentication operation failed
   */
  error: string | null;
  
  /**
   * Success message after a successful operation
   */
  successMessage: string | null;
  
  /**
   * True if MFA is enabled for the current user
   */
  mfaEnabled: boolean;
}
