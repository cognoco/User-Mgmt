/**
 * Authentication Domain Events
 * 
 * This file defines the events that can be emitted by the authentication service.
 * These events allow other parts of the application to react to authentication state changes.
 */

import { User } from './models';

/**
 * Base event interface that all authentication events extend
 */
export interface AuthEvent {
  /**
   * Type of the event
   */
  type: string;
  
  /**
   * Timestamp when the event occurred
   */
  timestamp: number;
}

/**
 * Event emitted when a user successfully logs in
 */
export interface UserLoggedInEvent extends AuthEvent {
  type: 'user_logged_in';
  
  /**
   * The user who logged in
   */
  user: User;
  
  /**
   * Whether this was a remembered session
   */
  remembered: boolean;
}

/**
 * Event emitted when a user logs out
 */
export interface UserLoggedOutEvent extends AuthEvent {
  type: 'user_logged_out';
  
  /**
   * The user who logged out
   */
  userId: string;
  
  /**
   * Whether this was due to a session timeout
   */
  sessionExpired: boolean;
}

/**
 * Event emitted when a new user registers
 */
export interface UserRegisteredEvent extends AuthEvent {
  type: 'user_registered';
  
  /**
   * The newly registered user
   */
  user: User;
  
  /**
   * Whether email verification is required
   */
  requiresEmailVerification: boolean;
}

/**
 * Event emitted when a user verifies their email
 */
export interface EmailVerifiedEvent extends AuthEvent {
  type: 'email_verified';
  
  /**
   * The user who verified their email
   */
  userId: string;
  
  /**
   * The verified email address
   */
  email: string;
}

/**
 * Event emitted when a user requests a password reset
 */
export interface PasswordResetRequestedEvent extends AuthEvent {
  type: 'password_reset_requested';
  
  /**
   * The email address that requested the reset
   */
  email: string;
}

/**
 * Event emitted when a user successfully resets their password
 */
export interface PasswordResetCompletedEvent extends AuthEvent {
  type: 'password_reset_completed';
  
  /**
   * The user who reset their password
   */
  userId: string;
}

/**
 * Event emitted when a user updates their password
 */
export interface PasswordUpdatedEvent extends AuthEvent {
  type: 'password_updated';
  
  /**
   * The user who updated their password
   */
  userId: string;
}

/**
 * Event emitted when a user enables MFA
 */
export interface MFAEnabledEvent extends AuthEvent {
  type: 'mfa_enabled';
  
  /**
   * The user who enabled MFA
   */
  userId: string;
}

/**
 * Event emitted when a user disables MFA
 */
export interface MFADisabledEvent extends AuthEvent {
  type: 'mfa_disabled';
  
  /**
   * The user who disabled MFA
   */
  userId: string;
}

/**
 * Event emitted when a user deletes their account
 */
export interface AccountDeletedEvent extends AuthEvent {
  type: 'account_deleted';
  
  /**
   * The ID of the deleted user
   */
  userId: string;
}

/**
 * Event emitted when authentication fails
 */
export interface AuthenticationFailedEvent extends AuthEvent {
  type: 'authentication_failed';
  
  /**
   * The email address that failed authentication
   */
  email: string;
  
  /**
   * The reason for the failure
   */
  reason: 'invalid_credentials' | 'account_locked' | 'rate_limited' | 'other';
  
  /**
   * Additional error message
   */
  error?: string;
}

/**
 * Union type of all authentication events
 */
export type AuthEventType = 
  | UserLoggedInEvent
  | UserLoggedOutEvent
  | UserRegisteredEvent
  | EmailVerifiedEvent
  | PasswordResetRequestedEvent
  | PasswordResetCompletedEvent
  | PasswordUpdatedEvent
  | MFAEnabledEvent
  | MFADisabledEvent
  | AccountDeletedEvent
  | AuthenticationFailedEvent;

/**
 * Authentication event listener type
 */
export type AuthEventListener = (event: AuthEventType) => void;

/**
 * Authentication event emitter interface
 */
export interface AuthEventEmitter {
  /**
   * Add a listener for all authentication events
   * 
   * @param listener Function to call when any authentication event occurs
   * @returns Function to remove the listener
   */
  addListener(listener: AuthEventListener): () => void;
  
  /**
   * Add a listener for a specific authentication event type
   * 
   * @param eventType Type of event to listen for
   * @param listener Function to call when the specified event occurs
   * @returns Function to remove the listener
   */
  addListenerForType<T extends AuthEventType['type']>(
    eventType: T, 
    listener: (event: Extract<AuthEventType, { type: T }>) => void
  ): () => void;
  
  /**
   * Remove all listeners
   */
  removeAllListeners(): void;
}
