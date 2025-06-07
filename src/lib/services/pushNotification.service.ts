import { NotificationPayload } from "@/lib/services/notification.service";

/**
 * NotificationHandler interface
 * 
 * This interface defines the contract for notification handling that host applications
 * should implement according to their own notification systems (FCM, APNS, web push, etc.)
 * 
 * The user management module will use this interface to request notifications
 * but the actual implementation is left to the host application.
 */
export interface NotificationHandler {
  /**
   * Initialize the notification system
   * Host app should implement this to set up their notification infrastructure
   */
  initialize(): Promise<void>;
  
  /**
   * Request permission to send notifications
   * Returns true if permission is granted, false otherwise
   */
  requestPermission(): Promise<boolean>;
  
  /**
   * Check if notifications are enabled for this user
   */
  areNotificationsEnabled(): boolean;
  
  /**
   * Display a notification to the user
   * @param payload The notification content
   */
  showNotification(payload: NotificationPayload): Promise<boolean>;
  
  /**
   * Associate the current device/browser with a user ID for targeted notifications
   * @param userId The user to associate with this device
   */
  registerDevice(userId: string): Promise<boolean>;
  
  /**
   * Remove association between user ID and current device/browser
   * @param userId The user to unregister from this device
   */
  unregisterDevice(userId: string): Promise<boolean>;
}

/**
 * Default implementation that does nothing but logs messages
 * Host applications should replace this with their actual implementation
 */
class DefaultNotificationHandler implements NotificationHandler {
  async initialize(): Promise<void> {
    console.log('DefaultNotificationHandler: No implementation provided by host application');
  }
  
  async requestPermission(): Promise<boolean> {
    console.log('DefaultNotificationHandler: No implementation provided by host application');
    return false;
  }
  
  areNotificationsEnabled(): boolean {
    return false;
  }
  
  async showNotification(payload: NotificationPayload): Promise<boolean> {
    console.log('DefaultNotificationHandler: Would show notification', payload);
    return false;
  }
  
  async registerDevice(userId: string): Promise<boolean> {
    console.log('DefaultNotificationHandler: Would register device for user', userId);
    return false;
  }
  
  async unregisterDevice(userId: string): Promise<boolean> {
    console.log('DefaultNotificationHandler: Would unregister device for user', userId);
    return false;
  }
}

// Singleton instance - host application should replace this with their implementation
let notificationHandler: NotificationHandler = new DefaultNotificationHandler();

/**
 * Set a custom notification handler implementation
 * Host applications should call this during initialization to provide their implementation
 */
export function setNotificationHandler(handler: NotificationHandler): void {
  notificationHandler = handler;
}

/**
 * Get the current notification handler
 * The user management module will use this to request notifications
 */
export function getNotificationHandler(): NotificationHandler {
  return notificationHandler;
}