/**
 * User Management Domain Events
 * 
 * This file defines the events that can be emitted by the user management service.
 * These events allow other parts of the application to react to user profile changes.
 */

import { UserProfile, UserPreferences, ProfileVisibility } from './models';

/**
 * Base event interface that all user management events extend
 */
export interface UserEvent {
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
 * Event emitted when a user profile is updated
 */
export interface UserProfileUpdatedEvent extends UserEvent {
  type: 'user_profile_updated';
  
  /**
   * ID of the user whose profile was updated
   */
  userId: string;
  
  /**
   * The updated user profile
   */
  profile: UserProfile;
  
  /**
   * Fields that were updated
   */
  updatedFields: string[];
}

/**
 * Event emitted when a user's preferences are updated
 */
export interface UserPreferencesUpdatedEvent extends UserEvent {
  type: 'user_preferences_updated';
  
  /**
   * ID of the user whose preferences were updated
   */
  userId: string;
  
  /**
   * The updated user preferences
   */
  preferences: UserPreferences;
  
  /**
   * Fields that were updated
   */
  updatedFields: string[];
}

/**
 * Event emitted when a user uploads a new profile picture
 */
export interface ProfilePictureUploadedEvent extends UserEvent {
  type: 'profile_picture_uploaded';
  
  /**
   * ID of the user who uploaded a profile picture
   */
  userId: string;
  
  /**
   * URL of the uploaded profile picture
   */
  imageUrl: string;
}

/**
 * Event emitted when a user deletes their profile picture
 */
export interface ProfilePictureDeletedEvent extends UserEvent {
  type: 'profile_picture_deleted';
  
  /**
   * ID of the user who deleted their profile picture
   */
  userId: string;
}

/**
 * Event emitted when a user's profile visibility settings are updated
 */
export interface ProfileVisibilityUpdatedEvent extends UserEvent {
  type: 'profile_visibility_updated';
  
  /**
   * ID of the user whose visibility settings were updated
   */
  userId: string;
  
  /**
   * The updated visibility settings
   */
  visibility: ProfileVisibility;
}

/**
 * Event emitted when a user account is deactivated
 */
export interface UserDeactivatedEvent extends UserEvent {
  type: 'user_deactivated';
  
  /**
   * ID of the deactivated user
   */
  userId: string;
  
  /**
   * Reason for deactivation, if provided
   */
  reason?: string;
}

/**
 * Event emitted when a previously deactivated user account is reactivated
 */
export interface UserReactivatedEvent extends UserEvent {
  type: 'user_reactivated';
  
  /**
   * ID of the reactivated user
   */
  userId: string;
}

/**
 * Event emitted when a user's account type is converted
 */
export interface UserTypeConvertedEvent extends UserEvent {
  type: 'user_type_converted';
  
  /**
   * ID of the user whose account type was converted
   */
  userId: string;
  
  /**
   * Previous account type
   */
  previousType: string;
  
  /**
   * New account type
   */
  newType: string;
}

/**
 * Union type of all user management events
 */
export type UserEventType = 
  | UserProfileUpdatedEvent
  | UserPreferencesUpdatedEvent
  | ProfilePictureUploadedEvent
  | ProfilePictureDeletedEvent
  | ProfileVisibilityUpdatedEvent
  | UserDeactivatedEvent
  | UserReactivatedEvent
  | UserTypeConvertedEvent;
