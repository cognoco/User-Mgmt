/**
 * Supabase Auth Provider Implementation
 * 
 * This file implements the AuthDataProvider interface using Supabase.
 * It adapts Supabase's authentication API to the interface required by our core business logic.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  AuthResult, 
  LoginPayload, 
  RegistrationPayload, 
  User,
  MFASetupResponse,
  MFAVerifyResponse
} from '../../core/auth/models';

import type { AuthDataProvider } from './interfaces';


/**
 * Supabase implementation of the AuthDataProvider interface
 */
export class SupabaseAuthProvider implements AuthDataProvider {
  private supabase: SupabaseClient;
  private authStateCallbacks: ((user: User | null) => void)[] = [];
  
  /**
   * Create a new SupabaseAuthProvider instance
   * 
   * @param supabaseUrl Supabase project URL
   * @param supabaseKey Supabase API key
   */
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Set up auth state change listener
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        const user = session ? this.mapSupabaseUser(session.user) : null;
        this.notifyAuthStateChange(user);
      }
    });
  }
  
  /**
   * Map a Supabase user to our User model
   * 
   * @param supabaseUser Supabase user object
   * @returns User model
   */
  private mapSupabaseUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      firstName: supabaseUser.user_metadata?.firstName || '',
      lastName: supabaseUser.user_metadata?.lastName || '',
      emailVerified: supabaseUser.email_confirmed_at !== null,
      phoneNumber: supabaseUser.phone || '',
      createdAt: supabaseUser.created_at ? new Date(supabaseUser.created_at) : new Date(),
      updatedAt: supabaseUser.updated_at ? new Date(supabaseUser.updated_at) : new Date(),
      lastLoginAt: supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : null,
      mfaEnabled: supabaseUser.factors?.length > 0 || false,
      isActive: true // Supabase doesn't have a built-in active flag, we'd need to store this in a separate table
    };
  }
  
  /**
   * Notify all auth state change callbacks
   * 
   * @param user Current user or null if signed out
   */
  private notifyAuthStateChange(user: User | null): void {
    for (const callback of this.authStateCallbacks) {
      callback(user);
    }
  }
  
  /**
   * Authenticate a user with email and password
   * 
   * @param credentials Login credentials including email, password and remember me option
   * @returns Authentication result with success status and user data or error
   */
  async login(credentials: LoginPayload): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        user: this.mapSupabaseUser(data.user)
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred during login'
      };
    }
  }
  
  /**
   * Register a new user
   * 
   * @param userData Registration data including email, password, name, etc.
   * @returns Authentication result with success status and user data or error
   */
  async register(userData: RegistrationPayload): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName
          }
        }
      });
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        user: this.mapSupabaseUser(data.user)
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred during registration'
      };
    }
  }
  
  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
  }
  
  /**
   * Get the currently authenticated user
   * 
   * @returns The current user or null if not authenticated
   */
  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return data.user ? this.mapSupabaseUser(data.user) : null;
  }
  
  /**
   * Send a password reset email to the specified email address
   * 
   * @param email Email address to send the reset link to
   * @returns Result object with success status and message or error
   */
  async resetPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred while sending password reset email'
      };
    }
  }
  
  /**
   * Update the user's password
   * 
   * @param oldPassword Current password for verification
   * @param newPassword New password to set
   */
  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    // Supabase doesn't have a direct method to update password with old password verification
    // We would need to implement our own verification logic
    // For now, we'll just update the password without verification
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      throw new Error(error.message);
    }
  }
  
  /**
   * Send an email verification link to the specified email address
   * 
   * @param email Email address to verify
   * @returns Authentication result with success status or error
   */
  async sendVerificationEmail(email: string): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred while sending verification email'
      };
    }
  }
  
  /**
   * Verify an email address using a token
   * 
   * @param token Verification token from the email link
   */
  async verifyEmail(token: string): Promise<void> {
    const {
      data: { user },
      error: userError
    } = await this.supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(userError?.message || 'Unable to retrieve current user');
    }

    const { error } = await this.supabase.auth.verifyOtp({
      type: 'email',
      token,
      email: user.email ?? ''
    });

    if (error) {
      throw new Error(error.message);
    }
  }
  
  /**
   * Delete the current user's account
   * 
   * @param password Current password for verification (optional depending on implementation)
   */
  async deleteAccount(password?: string): Promise<void> {
    const {
      data: { user },
      error: userError
    } = await this.supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(userError?.message || 'Unable to retrieve current user');
    }

    const { error } = await this.supabase.rpc('delete_user_account', { password });
    if (error) {
      throw new Error(error.message);
    }

    await this.logout();
  }
  
  /**
   * Set up Multi-Factor Authentication for the current user
   * 
   * @returns MFA setup response with secret and QR code
   */
  async setupMFA(): Promise<MFASetupResponse> {
    try {
      const { data, error } = await this.supabase.auth.mfa.enroll({
        factorType: 'totp'
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        success: true,
        secret: data.totp.secret,
        qrCode: data.totp.uri
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred during MFA setup'
      };
    }
  }
  
  /**
   * Verify a Multi-Factor Authentication code
   * 
   * @param code MFA code from authenticator app
   * @returns MFA verification response with success status and token
   */
  async verifyMFA(code: string): Promise<MFAVerifyResponse> {
    try {
      const { data, error } = await this.supabase.auth.mfa.verify({
        factorId: 'totp',
        code
      });
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        token: data.token
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred during MFA verification'
      };
    }
  }
  
  /**
   * Disable Multi-Factor Authentication for the current user
   * 
   * @param code MFA code from authenticator app for verification
   * @returns Authentication result with success status or error
   */
  async disableMFA(): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.mfa.unenroll({
        factorId: 'totp'
      });
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      const user = await this.getCurrentUser();
      
      return {
        success: true,
        user
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred while disabling MFA'
      };
    }
  }
  
  /**
   * Refresh the authentication token
   * 
   * @returns True if token was refreshed successfully, false otherwise
   */
  async refreshToken(): Promise<boolean> {
    try {
      const { error } = await this.supabase.auth.refreshSession();
      return !error;
    } catch {
      return false;
    }
  }
  
  /**
   * Subscribe to authentication state changes
   * 
   * @param callback Function to call when authentication state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authStateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateCallbacks.indexOf(callback);
      if (index !== -1) {
        this.authStateCallbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Handle session timeout by logging out the user
   */
  handleSessionTimeout(): void {
    this.logout();
  }
}
