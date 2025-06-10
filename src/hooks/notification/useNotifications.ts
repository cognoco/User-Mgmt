import { useState, useCallback } from 'react';
import { UserManagementConfiguration } from '@/core/config';
import type { NotificationService } from '@/core/notification/interfaces';
import type { Notification, NotificationFilter } from '@/core/notification/models';

export interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (filter?: NotificationFilter) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (filter?: NotificationFilter) => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const notificationService = UserManagementConfiguration.getServiceProvider<NotificationService>('notificationService');
  if (!notificationService) {
    throw new Error('NotificationService is not registered in the service provider registry');
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (filter?: NotificationFilter) => {
    setLoading(true);
    setError(null);
    try {
      const batch = await notificationService.getUserNotifications('me', filter);
      setNotifications(batch.notifications);
      setUnreadCount(batch.unreadCount);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(message);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [notificationService]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [notificationService]);

  const markAllAsRead = useCallback(async (filter?: NotificationFilter) => {
    await notificationService.markAllAsRead('me', filter);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, [notificationService]);

  return { notifications, unreadCount, loading, error, fetchNotifications, markAsRead, markAllAsRead };
}

export default useNotifications;
