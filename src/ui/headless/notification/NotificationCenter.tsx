import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/notification/useNotifications';
import type { Notification } from '@/core/notification/models';

export interface NotificationCenterRenderProps {
  notifications: Notification[];
  isLoading: boolean;
  unreadCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

export interface NotificationCenterProps {
  render: (props: NotificationCenterRenderProps) => React.ReactNode;
}

export function NotificationCenter({ render }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <>{render({
      notifications,
      isLoading: loading,
      unreadCount,
      activeTab,
      setActiveTab,
      markAsRead,
      markAllAsRead,
      fetchNotifications,
    })}</>
  );
}

export default NotificationCenter;
