import { NotificationPayload } from "./notification.service";

// Interface for browser push subscription
export interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Interface for device token registration
export interface DeviceRegistration {
  userId: string;
  deviceId: string;
  platform: 'web' | 'ios' | 'android' | 'react-native';
  token?: string;  // FCM/APNS token
  subscription?: PushSubscriptionJSON;  // Web Push subscription
  createdAt: Date;
  lastUsed: Date;
}

// JSON representation of PushSubscription for storage/transmission
export interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  private vapidPublicKey: string | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private pushEnabled = false;
  private currentSubscription: PushSubscription | null = null;

  constructor() {
    // Initialize when in browser environment
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  // Initialize the service
  async initialize() {
    try {
      // Check if push notifications are supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Workers are not supported in this browser');
        return;
      }

      if (!('PushManager' in window)) {
        console.warn('Push notifications are not supported in this browser');
        return;
      }

      // Fetch VAPID public key from the backend
      await this.getVapidPublicKey();

      // Register service worker if none exists
      await this.registerServiceWorker();

      // Check if already subscribed
      this.checkSubscription();
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  // Get VAPID public key from the server
  private async getVapidPublicKey() {
    try {
      const response = await fetch('/api/notifications/vapid-public-key');
      if (response.ok) {
        const data = await response.json();
        this.vapidPublicKey = data.vapidPublicKey;
      } else {
        console.error('Failed to fetch VAPID public key');
      }
    } catch (error) {
      console.error('Error fetching VAPID public key:', error);
    }
  }

  // Register the service worker
  private async registerServiceWorker() {
    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/push-notification-sw.js');
      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Check if already subscribed to push notifications
  private async checkSubscription() {
    if (!this.serviceWorkerRegistration) {
      return;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      this.pushEnabled = !!subscription;
      this.currentSubscription = subscription;
      console.log('Push notification subscription status:', this.pushEnabled);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  }

  // Subscribe to push notifications
  async subscribe(userId: string): Promise<{ success: boolean; subscription?: PushSubscriptionJSON }> {
    if (!this.serviceWorkerRegistration || !this.vapidPublicKey) {
      return { success: false };
    }

    try {
      // Convert base64 to Uint8Array
      const vapidKey = this.urlBase64ToUint8Array(this.vapidPublicKey);

      // Subscribe to push
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      // Convert to JSON for storage/transmission
      const subscriptionJSON = subscription.toJSON() as PushSubscriptionJSON;

      // Store subscription on server
      const registered = await this.registerSubscriptionOnServer(userId, subscriptionJSON);
      
      if (registered) {
        this.pushEnabled = true;
        this.currentSubscription = subscription;
        return { success: true, subscription: subscriptionJSON };
      } else {
        // If server registration failed, unsubscribe to avoid inconsistency
        await subscription.unsubscribe();
        return { success: false };
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return { success: false };
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(userId: string): Promise<boolean> {
    if (!this.currentSubscription) {
      return true; // Already unsubscribed
    }

    try {
      // Unsubscribe from push
      const success = await this.currentSubscription.unsubscribe();
      
      if (success) {
        // Remove subscription from server
        await this.removeSubscriptionFromServer(userId);
        this.pushEnabled = false;
        this.currentSubscription = null;
      }
      
      return success;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Register subscription with the server
  private async registerSubscriptionOnServer(userId: string, subscription: PushSubscriptionJSON): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/register-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          platform: 'web',
          subscription
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to register subscription on server:', error);
      return false;
    }
  }

  // Remove subscription from the server
  private async removeSubscriptionFromServer(userId: string): Promise<boolean> {
    if (!this.currentSubscription) {
      return true;
    }
    
    try {
      const response = await fetch('/api/notifications/unregister-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          endpoint: this.currentSubscription.endpoint
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
      return false;
    }
  }

  // Send a test notification
  async sendTestNotification(): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/test-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return false;
    }
  }

  // Get current subscription status
  isPushEnabled(): boolean {
    return this.pushEnabled;
  }

  // Get the current subscription as JSON for storage/transmission
  getCurrentSubscription(): PushSubscriptionJSON | null {
    if (!this.currentSubscription) {
      return null;
    }
    return this.currentSubscription.toJSON() as PushSubscriptionJSON;
  }

  // Handle an incoming notification
  handleNotification(payload: NotificationPayload) {
    // Display notification using the Notification API
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return;
    }

    // Request permission if not granted
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
      return;
    }

    // Create and show notification
    const notification = new Notification(payload.title, {
      body: payload.message,
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      data: payload.data
    });

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      
      // Handle specific action if provided in data
      if (payload.data?.action?.url) {
        window.location.href = payload.data.action.url;
      }
    };
  }

  // Utility function to convert base64 string to Uint8Array for VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
}

// Singleton instance
export const pushNotificationService = new PushNotificationService();

// Initialize at application startup
export const initializePushNotifications = () => {
  pushNotificationService.initialize();
}; 