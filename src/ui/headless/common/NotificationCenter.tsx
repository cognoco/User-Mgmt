import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { CompanyNotificationLog } from '@/types/company';

/**
 * Headless Notification Center
 *
 * Manages notifications and exposes state via render prop.
 */

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'system' | 'security' | 'account' | 'promotional' | 'updates' | 'activity' | 'sso';
  isRead: boolean;
  created_at: string;
  action?: {
    label: string;
    url?: string;
    callback?: string;
  };
}

export default function NotificationCenter({
  render
}: {
  render: (props: {
    notifications: Notification[];
    isLoading: boolean;
    unreadCount: number;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
  }) => React.ReactNode;
}) {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_notification_logs')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('channel', 'in_app')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped: Notification[] = (data as (CompanyNotificationLog & { is_read?: boolean; })[]).map((log) => {
        let category: Notification['category'] = 'system';
        if (log.notification_type === 'sso_event') category = 'sso';
        else if (log.notification_type === 'security_alert') category = 'security';
        else if (log.notification_type === 'new_member_domain' || log.notification_type === 'domain_verified' || log.notification_type === 'domain_verification_failed') category = 'account';
        return {
          id: log.id,
          userId: log.recipient_id || '',
          title: log.content?.subject || 'Notification',
          message: log.content?.content || '',
          category,
          isRead: !!log.is_read,
          created_at: log.created_at,
        };
      });
      setNotifications(mapped);
      setUnreadCount(mapped.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('company_notification_logs')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      if (unreadIds.length === 0) return;
      const { error } = await supabase
        .from('company_notification_logs')
        .update({ is_read: true })
        .in('id', unreadIds);
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, payload => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          if (!(payload.new as Notification).isRead) setUnreadCount(prev => prev + 1);
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev => {
            const updated = prev.map(n => n.id === payload.new.id ? payload.new as Notification : n);
            setUnreadCount(updated.filter(n => !n.isRead).length);
            return updated;
          });
        } else if (payload.eventType === 'DELETE') {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          if (!(payload.old as Notification).isRead) setUnreadCount(prev => prev - 1);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  return (
    <>{render({ notifications, isLoading, unreadCount, activeTab, setActiveTab, markAsRead, markAllAsRead, fetchNotifications })}</>
  );
}
