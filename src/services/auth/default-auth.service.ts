/**
 * Default Authentication Service Implementation
 *
 * This file implements the AuthService interface defined in the core layer.
 * It provides the default implementation for authentication operations.
 */

import { AuthService, AuthState } from "@/core/auth/interfaces";
import type { IAuthDataProvider } from "@/core/auth/IAuthDataProvider";
import { 
  AuthResult, 
  LoginPayload, 
  MFASetupResponse, 
  MFAVerifyResponse, 
  RegistrationPayload, 
  User 
} from '@/core/auth/models';
import { AuthEventHandler, AuthEventTypes } from '@/core/auth/events';
import { translateError } from '@/lib/utils/error';
import { TypedEventEmitter } from '@/lib/utils/typed-event-emitter';
import type { SessionTracker } from './session-tracker';
import { DefaultSessionTracker } from './session-tracker';
import type { MFAHandler } from './mfa-handler';
import { DefaultMFAHandler } from './mfa-handler';

/**
 * Default implementation of the AuthService interface
 */
export class DefaultAuthService
  extends TypedEventEmitter<AuthEventTypes>
  implements AuthService
{
  private user: User | null = null;
  private token: string | null = null;
  private isLoading = false;
  private error: string | null = null;
  private successMessage: string | null = null;
  private mfaEnabled = false;

  // Session management handled by SessionTracker
  private sessionTracker: SessionTracker;
  private mfaHandler: MFAHandler;

  /**
   * Constructor for DefaultAuthService
   *
   * @param authDataProvider - Adapter providing auth persistence methods
   */
  constructor(
    private authDataProvider: IAuthDataProvider,
  ) {
    super();
    this.sessionTracker = new DefaultSessionTracker({
      refreshToken: () => this.refreshToken(),
      onSessionTimeout: () => this.handleSessionTimeout()
    });
    this.mfaHandler = new DefaultMFAHandler(authDataProvider);
  }

  /**
   * Emit an authentication event
   *
   * @param event - The event to emit
   */
  private emitEvent(event: AuthEventTypes): void {
    this.emit(event);
  }

  /**
   * Authenticate a user with email and password
   *
   * @param credentials - Login credentials
   * @returns Authentication result
   */
  async login(credentials: LoginPayload): Promise<AuthResult> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.authDataProvider.login(credentials);

      this.isLoading = false;
      if (result.success) {
        this.user = result.user || null;
        this.token = result.token || null;
        this.error = null;

        // Store token using provided storage if available
        if (result.token && typeof window !== 'undefined') {
          localStorage.setItem('auth_token', result.token);
        }

        // Initialize session management
        this.sessionTracker.updateLastActivity();
        this.sessionTracker.initializeSessionCheck();

        // Emit login event
        this.emitEvent({
          type: "LOGIN",
          timestamp: new Date(),
          user: this.user,
        });

        return result;
      }

      this.user = null;
      this.token = null;
      this.error = result.error || "An error occurred during login";

      // Emit login failed event
      this.emitEvent({
        type: "LOGIN_FAILED",
        timestamp: new Date(),
        error: this.error,
      });

      return { success: false, error: this.error, code: result.code };
    } catch (error: any) {
      const errorMessage = translateError(error, {
        defaultMessage: "An error occurred during login",
      });

      this.isLoading = false;
      this.error = errorMessage;
      this.user = null;
      this.token = null;

      // Emit login failed event
      this.emitEvent({
        type: "LOGIN_FAILED",
        timestamp: new Date(),
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Register a new user
   *
   * @param userData - Registration data
   * @returns Authentication result
   */
  async register(userData: RegistrationPayload): Promise<AuthResult> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.authDataProvider.register(userData);

      this.isLoading = false;
      if (result.success) {
        this.error = null;
        this.successMessage = "Registration successful!";

        // Emit registration event
        this.emitEvent({
          type: "REGISTRATION",
          timestamp: new Date(),
          email: userData.email,
        });

        return { success: true };
      }
      this.error = result.error || "Registration failed";

      // Emit registration failed event
      this.emitEvent({
        type: "REGISTRATION_FAILED",
        timestamp: new Date(),
        error: this.error,
      });

      return { success: false, error: this.error };
    } catch (error: any) {
      const errorMessage = translateError(error, {
        defaultMessage: "Registration failed",
      });

      this.isLoading = false;
      this.error = errorMessage;

      // Emit registration failed event
      this.emitEvent({
        type: "REGISTRATION_FAILED",
        timestamp: new Date(),
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    try {
      await this.authDataProvider.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.sessionTracker.cleanup();
      
      this.user = null;
      this.token = null;
      this.error = null;
      this.successMessage = null;
      
      // Clear stored auth data if available
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('last_activity');
      }

      // Emit logout event
      this.emitEvent({
        type: "LOGOUT",
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get the currently authenticated user
   *
   * @returns The current user or null if not authenticated
   */
  async getCurrentUser(): Promise<User | null> {
    if (this.user) {
      return this.user;
    }

    try {
      this.user = await this.authDataProvider.getCurrentUser();
      return this.user;
    } catch (error: any) {
      this.error = translateError(error, {
        defaultMessage: "Failed to retrieve current user",
      });
      return null;
    }
  }

  /**
   * Check if a user is currently authenticated
   *
   * @returns True if a user is authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return !!this.user;
  }

  /**
   * Send a password reset email to the specified email address
   *
   * @param email - Email address to send the reset link to
   * @returns Result object with success status and message or error
   */
  async resetPassword(
    email: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    try {
      const result = await this.authDataProvider.resetPassword(email);

      this.isLoading = false;
      if (result.success) {
        this.successMessage =
          result.message || "Password reset email sent. Check your inbox.";

        // Emit password reset event
        this.emitEvent({
          type: "PASSWORD_RESET_REQUESTED",
          timestamp: new Date(),
          email,
        });

        return { success: true, message: this.successMessage };
      }

      this.error = result.error || "Failed to send password reset email.";

      // Emit password reset failed event
      this.emitEvent({
        type: "PASSWORD_RESET_FAILED",
        timestamp: new Date(),
        error: this.error,
      });

      return { success: false, error: this.error };
    } catch (error: any) {
      const errorMessage = translateError(error, {
        defaultMessage: "Failed to send password reset email.",
      });

      this.isLoading = false;
      this.error = errorMessage;

      // Emit password reset failed event
      this.emitEvent({
        type: "PASSWORD_RESET_FAILED",
        timestamp: new Date(),
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Update the user's password
   *
   * @param oldPassword - Current password for verification
   * @param newPassword - New password to set
   */
  async updatePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    try {
      await this.authDataProvider.updatePassword(oldPassword, newPassword);

      this.isLoading = false;
      this.successMessage = "Password updated successfully.";

      // Emit password updated event
      this.emitEvent({
        type: "PASSWORD_UPDATED",
        timestamp: new Date(),
      });
    } catch (error: any) {
      const errorMessage = translateError(error, {
        defaultMessage: "Failed to update password.",
      });

      this.isLoading = false;
      this.error = errorMessage;

      // Emit password update failed event
      this.emitEvent({
        type: "PASSWORD_UPDATE_FAILED",
        timestamp: new Date(),
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  }

  /**
   * Send an email verification link to the specified email address
   *
   * @param email - Email address to verify
   * @returns Authentication result with success status or error
   */
  async sendVerificationEmail(email: string): Promise<AuthResult> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.authDataProvider.sendVerificationEmail(email);

      this.isLoading = false;
      if (result.success) {
        this.error = null;
        this.successMessage = "Verification email sent successfully.";

        // Emit email verification sent event
        this.emitEvent({
          type: "EMAIL_VERIFICATION_SENT",
          timestamp: new Date(),
          email,
        });

        return { success: true };
      }

      this.error = result.error || "Failed to send verification email";

      // Emit email verification failed event
      this.emitEvent({
        type: "EMAIL_VERIFICATION_FAILED",
        timestamp: new Date(),
        error: this.error,
      });

      return { success: false, error: this.error };
    } catch (error: any) {
      const errorMessage = translateError(error, {
        defaultMessage: "Failed to send verification email",
      });

      this.isLoading = false;
      this.error = errorMessage;

      this.emitEvent({
        type: "EMAIL_VERIFICATION_FAILED",
        timestamp: new Date(),
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Verify an email address using a token
   *
   * @param token - Verification token from the email link
   */
  async verifyEmail(token: string): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    try {
      await this.authDataProvider.verifyEmail(token);

      this.isLoading = false;
      this.successMessage = "Email verified successfully!";

      // Emit email verified event
      this.emitEvent({
        type: "EMAIL_VERIFIED",
        timestamp: new Date(),
      });
    } catch (error: any) {
      const errorMessage = translateError(error, {
        defaultMessage: "Email verification failed.",
      });

      this.isLoading = false;
      this.error = errorMessage;

      // Emit email verification failed event
      this.emitEvent({
        type: "EMAIL_VERIFICATION_FAILED",
        timestamp: new Date(),
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  }

  /**
   * Delete the current user's account
   *
   * @param password - Current password for verification (optional depending on implementation)
   */
  async deleteAccount(password?: string): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    try {
      await this.authDataProvider.deleteAccount(password);
      
      this.sessionTracker.cleanup();
      
      this.isLoading = false;
      this.successMessage = "Account deleted successfully.";
      this.user = null;
      this.token = null;

      
      // Clear stored auth data if available
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('last_activity');

      }

      // Emit account deleted event
      this.emitEvent({
        type: "ACCOUNT_DELETED",
        timestamp: new Date(),
      });
    } catch (error: any) {
      const errorMessage = translateError(error, {
        defaultMessage: "Failed to delete account.",
      });

      this.isLoading = false;
      this.error = errorMessage;

      // Emit account deletion failed event
      this.emitEvent({
        type: "ACCOUNT_DELETION_FAILED",
        timestamp: new Date(),
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  }

  /**
   * Set up Multi-Factor Authentication for the current user
   *
   * @returns MFA setup response with secret and QR code
   */
  async setupMFA(): Promise<MFASetupResponse> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.mfaHandler.setupMFA();

      this.isLoading = false;
      if (result.success) {
        this.error = null;

        this.emitEvent({
          type: "MFA_SETUP",
          timestamp: new Date(),
        });

        return {
          success: true,
          secret: result.secret,
          qrCode: result.qrCode,
        };
      }

      this.error = result.error || "Failed to setup MFA";

      this.emitEvent({
        type: "MFA_SETUP_FAILED",
        timestamp: new Date(),
        error: this.error,
      });

      return {
        success: false,
        error: this.error,
      };
    } catch (error: any) {
      const errorMessage = translateError(error, {
        defaultMessage: "Failed to setup MFA",
      });

      this.isLoading = false;
      this.error = errorMessage;

      this.emitEvent({
        type: "MFA_SETUP_FAILED",
        timestamp: new Date(),
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Verify a Multi-Factor Authentication code
   *
   * @param code - MFA code from authenticator app
   * @returns MFA verification response with success status and token
   */
  async verifyMFA(code: string): Promise<MFAVerifyResponse> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.mfaHandler.verifyMFA(code);

      this.isLoading = false;
      if (result.success) {
        this.mfaEnabled = true;
        this.successMessage = "MFA setup successful!";
        if (result.user) {
          this.user = result.user;
        }

        this.emitEvent({ type: "MFA_VERIFIED", timestamp: new Date() });

        return {
          success: true,
          backupCodes: result.backupCodes,
          token: result.token,
        };
      }

      this.error = result.error || "Failed to verify MFA code";

      this.emitEvent({
        type: "MFA_VERIFICATION_FAILED",
        timestamp: new Date(),
        error: this.error,
      });

      return { success: false, error: this.error };
    } catch (error: any) {
      const errorMessage = translateError(error, {
        defaultMessage: "Failed to verify MFA code",
      });

      this.isLoading = false;
      this.error = errorMessage;

      this.emitEvent({
        type: "MFA_VERIFICATION_FAILED",
        timestamp: new Date(),
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Disable Multi-Factor Authentication for the current user
   *
   * @param code - MFA code from authenticator app for verification
   * @returns Authentication result with success status or error
   */
  async disableMFA(code: string): Promise<AuthResult> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.mfaHandler.disableMFA(code);
      
      this.isLoading = false;
      this.error = null;
      this.mfaEnabled = false;
      this.successMessage = "MFA disabled successfully";

      // Emit MFA disabled event
      this.emitEvent({
        type: "MFA_DISABLED",
        timestamp: new Date(),
      });

      if (result.success) {
        this.isLoading = false;
        this.error = null;
        this.mfaEnabled = false;
        this.successMessage = "MFA disabled successfully";

        this.emitEvent({ type: "MFA_DISABLED", timestamp: new Date() });

        return { success: true };
      }

      const errorMessage = result.error || "Failed to disable MFA";

      this.isLoading = false;
      this.error = errorMessage;

      this.emitEvent({
        type: "MFA_DISABLE_FAILED",
        timestamp: new Date(),
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    } catch (error: any) {
      const errorMessage = translateError(error, {
        defaultMessage: "Failed to disable MFA",
      });

      this.isLoading = false;
      this.error = errorMessage;

      this.emitEvent({
        type: "MFA_DISABLE_FAILED",
        timestamp: new Date(),
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Refresh the authentication token
   *
   * @returns True if token was refreshed successfully, false otherwise
   */
  async refreshToken(): Promise<boolean> {
    try {
      const success = await this.authDataProvider.refreshToken();

      if (success) {
        this.emitEvent({ type: "TOKEN_REFRESHED", timestamp: new Date() });
      } else {
        this.handleSessionTimeout();
      }

      return success;
    } catch (error) {
      // If refresh fails, log out the user
      this.handleSessionTimeout();
      return false;
    }
  }

  /**
   * Handle session timeout by logging out the user
   */
  handleSessionTimeout(): void {
    this.sessionTracker.cleanup();
    
    this.user = null;
    this.token = null;
    this.error = "Session expired. Please log in again.";
    this.successMessage = null;

    
    // Clear stored auth data if available
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('last_activity');

    }

    // Emit session timeout event
    this.emitEvent({
      type: "SESSION_TIMEOUT",
      timestamp: new Date(),
    });
  }

  /**
   * Subscribe to authentication state changes
   *
   * @param callback - Function to call when authentication state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return this.on((event) => {
      if (
        event.type === "LOGIN" ||
        event.type === "LOGOUT" ||
        event.type === "SESSION_TIMEOUT"
      ) {
        callback(this.user);
      }
    });
  }
}
