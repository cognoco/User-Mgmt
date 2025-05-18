import { api } from '@/lib/api/axios';
import { notificationQueue } from './notification-queue.service';

export type Platform = 'web' | 'ios' | 'android' | 'react-native';

export interface NotificationConfig {
  enabled: boolean;
  platform?: Platform;
  providers: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    marketing?: boolean;
    inApp?: boolean;
  };
  apiEndpoint?: string;
  // Mobile-specific configuration
  mobileConfig?: {
    fcmToken?: string;       // Firebase Cloud Messaging token for Android
    apnsToken?: string;      // Apple Push Notification Service token for iOS
    deviceId?: string;       // Unique device identifier
    nativeHandler?: (payload: NotificationPayload) => Promise<void>; // Native handler for mobile
  };
  // User preferences reference
  userPreferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      marketing?: boolean;
    }
  };
}

export interface NotificationPayload {
  type: 'email' | 'push' | 'sms' | 'marketing' | 'inApp';
  title: string;
  message: string;
  data?: Record<string, any>;
  // Mobile-specific fields
  priority?: 'default' | 'high' | 'max';
  badge?: number;
  sound?: string;
  channel?: string; // Android notification channel
  // Category for filtering/grouping
  category?: 'system' | 'security' | 'account' | 'promotional' | 'updates' | 'activity';
  // Tracking fields
  trackingId?: string; // Set when added to queue
}

class NotificationService {
  private config: NotificationConfig = {
    enabled: false,
    platform: 'web',
    providers: {
      email: false,
      push: false,
      sms: false,
      marketing: false,
      inApp: false,
    },
    apiEndpoint: '/api/notifications'
  };

  constructor(config?: Partial<NotificationConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Register notification processors with the queue
    this.registerQueueProcessors();
  }

  private registerQueueProcessors() {
    // Register processor for email notifications
    notificationQueue.registerProcessor('email', async (payload) => {
      return this.processEmailNotification(payload);
    });
    
    // Register processor for push notifications
    notificationQueue.registerProcessor('push', async (payload) => {
      return this.processPushNotification(payload);
    });
    
    // Register processor for SMS notifications
    notificationQueue.registerProcessor('sms', async (payload) => {
      return this.processSMSNotification(payload);
    });
    
    // Register processor for in-app notifications
    notificationQueue.registerProcessor('inApp', async (payload) => {
      return this.processInAppNotification(payload);
    });
    
    // Register processor for marketing notifications
    notificationQueue.registerProcessor('marketing', async (payload) => {
      return this.processMarketingNotification(payload);
    });
  }

  setConfig(config: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...config };
  }

  isEnabled() {
    return this.config.enabled;
  }

  isProviderEnabled(provider: keyof NotificationConfig['providers']) {
    return this.config.enabled && this.config.providers[provider] === true;
  }

  getPlatform(): Platform {
    return this.config.platform || 'web';
  }

  isMobilePlatform() {
    const platform = this.getPlatform();
    return platform === 'ios' || platform === 'android' || platform === 'react-native';
  }

  async send(payload: NotificationPayload) {
    if (!this.isEnabled() || !this.isProviderEnabled(payload.type)) {
      return { success: false, reason: 'Provider disabled' };
    }

    // Check if user has disabled this type of notification in their preferences
    if (this.config.userPreferences?.notifications) {
      const { notifications } = this.config.userPreferences;
      
      // If this is a marketing notification and user has disabled marketing notifications
      if (payload.type === 'marketing' && notifications.marketing === false) {
        console.log('Marketing notifications disabled by user preference');
        return { success: false, reason: 'Disabled by user preference' };
      }
      
      // If this is an email notification and user has disabled email notifications
      if (payload.type === 'email' && notifications.email === false) {
        console.log('Email notifications disabled by user preference');
        return { success: false, reason: 'Disabled by user preference' };
      }
      
      // If this is a push notification and user has disabled push notifications
      if (payload.type === 'push' && notifications.push === false) {
        console.log('Push notifications disabled by user preference');
        return { success: false, reason: 'Disabled by user preference' };
      }
    }

    try {
      // Add the notification to the queue for processing, tracking, and retry
      const trackingId = notificationQueue.enqueue(payload);
      
      // Return tracking ID so caller can check status later
      return { success: true, trackingId };
    } catch (error) {
      console.error('Failed to queue notification:', error);
      return { success: false, reason: 'Failed to queue notification' };
    }
  }

  // Add platform-specific data to the payload
  private addPlatformData(payload: NotificationPayload): NotificationPayload & { platform?: any } {
    const platform = this.getPlatform();
    const finalPayload = { ...payload, platform };

    // Add platform-specific tokens
    if (platform === 'android' && this.config.mobileConfig?.fcmToken) {
      finalPayload.data = {
        ...finalPayload.data,
        fcmToken: this.config.mobileConfig.fcmToken,
      };
    } else if (platform === 'ios' && this.config.mobileConfig?.apnsToken) {
      finalPayload.data = {
        ...finalPayload.data,
        apnsToken: this.config.mobileConfig.apnsToken,
      };
    }

    // Add device ID if available
    if (this.config.mobileConfig?.deviceId) {
      finalPayload.data = {
        ...finalPayload.data,
        deviceId: this.config.mobileConfig.deviceId,
      };
    }

    return finalPayload;
  }

  // Implementation of email notification delivery
  private async processEmailNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      // Add platform data
      const platformPayload = this.addPlatformData(payload);
      
      // For mobile platforms with native handler
      if (this.isMobilePlatform() && this.config.mobileConfig?.nativeHandler && payload.type === 'email') {
        await this.config.mobileConfig.nativeHandler(payload);
        return true;
      }
      
      // For web or when no native handler available
      const response = await api.post('/api/notifications/email', platformPayload);
      return response.status === 200;
    } catch (error) {
      console.error('Failed to process email notification:', error);
      return false;
    }
  }

  // Implementation of push notification delivery
  private async processPushNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      // Add platform data
      const platformPayload = this.addPlatformData(payload);
      
      // For mobile platforms with native handler
      if (this.isMobilePlatform() && this.config.mobileConfig?.nativeHandler) {
        await this.config.mobileConfig.nativeHandler(payload);
        return true;
      }
      
      // For web push or when no native handler available
      const response = await api.post('/api/notifications/push', platformPayload);
      return response.status === 200;
    } catch (error) {
      console.error('Failed to process push notification:', error);
      return false;
    }
  }

  // Implementation of SMS notification delivery
  private async processSMSNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      const response = await api.post('/api/notifications/sms', payload);
      return response.status === 200;
    } catch (error) {
      console.error('Failed to process SMS notification:', error);
      return false;
    }
  }

  // Implementation of in-app notification delivery
  private async processInAppNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      const response = await api.post('/api/notifications/in-app', payload);
      return response.status === 200;
    } catch (error) {
      console.error('Failed to process in-app notification:', error);
      return false;
    }
  }

  // Implementation of marketing notification delivery
  private async processMarketingNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      const response = await api.post('/api/notifications/marketing', payload);
      return response.status === 200;
    } catch (error) {
      console.error('Failed to process marketing notification:', error);
      return false;
    }
  }

  // Method to get tracking status for a notification
  getNotificationStatus(trackingId: string) {
    return notificationQueue.getStatus(trackingId);
  }

  // Method to get queue statistics
  getQueueStats() {
    return notificationQueue.getStats();
  }

  // Method to update user preferences
  setUserPreferences(preferences: NotificationConfig['userPreferences']) {
    this.config.userPreferences = preferences;
  }

  // Helper methods for different notification types
  async sendEmail(title: string, message: string, data?: Record<string, any>) {
    return this.send({ type: 'email', title, message, data });
  }

  async sendPush(title: string, message: string, data?: Record<string, any>) {
    return this.send({ type: 'push', title, message, data });
  }

  async sendSMS(title: string, message: string, data?: Record<string, any>) {
    return this.send({ type: 'sms', title, message, data });
  }

  async sendMarketing(title: string, message: string, data?: Record<string, any>) {
    return this.send({ type: 'marketing', title, message, data });
  }

  async sendInApp(title: string, message: string, data?: Record<string, any>) {
    return this.send({ type: 'inApp', title, message, data });
  }
}

// Create a singleton instance
export const notificationService = new NotificationService();

// Export a function to initialize the service with custom config
export const initializeNotifications = (config: Partial<NotificationConfig>) => {
  notificationService.setConfig(config);
}; 