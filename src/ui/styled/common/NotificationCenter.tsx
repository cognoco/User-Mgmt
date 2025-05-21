import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, RefreshCw, Info, ShieldAlert, Settings, MessageSquare, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { CompanyNotificationLog } from '@/types/company';

// Notification type with more details
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

const getIconForCategory = (category: Notification['category']) => {
  switch (category) {
    case 'sso':
      return <KeyRound className="h-4 w-4 text-indigo-500" />;
    case 'security':
      return <ShieldAlert className="h-4 w-4 text-red-500" />;
    case 'system':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'account':
      return <Settings className="h-4 w-4 text-yellow-500" />;
    case 'activity':
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, onMarkAsRead }) => {
  const formattedDate = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
  
  return (
    <div className={`p-3 hover:bg-gray-50 transition-colors ${notification.isRead ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5">
            {getIconForCategory(notification.category)}
          </div>
          <div>
            <p className={`text-sm font-medium ${notification.isRead ? '' : 'font-semibold'}`}>
              {notification.title}
            </p>
            <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
            {notification.action && (
              <div className="mt-2">
                {notification.action.url ? (
                  <Link href={notification.action.url}>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-500">
                      {notification.action.label}
                    </Button>
                  </Link>
                ) : (
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-500">
                    {notification.action.label}
                  </Button>
                )}
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-1">{formattedDate}</p>
          </div>
        </div>
        {!notification.isRead && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            <Check className="h-3 w-3" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * NotificationCenter Component
 * Displays user notifications with multiple categories and real-time updates.
 */
export const NotificationCenter: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications from company_notification_logs for the current user
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
      // Map company_notification_logs to Notification type
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

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('company_notification_logs')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      if (unreadIds.length === 0) return;
      const { error } = await supabase
        .from('company_notification_logs')
        .update({ is_read: true })
        .in('id', unreadIds);
      if (error) throw error;
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications'
        }, 
        payload => {
          // Handle different events
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev]);
            if (!(payload.new as Notification).isRead) {
              setUnreadCount(prev => prev + 1);
            }
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(notif => 
                notif.id === payload.new.id ? payload.new as Notification : notif
              )
            );
            // Recalculate unread count
            setNotifications(currentNotifications => {
              // Calculate new unread count based on updated notifications
              const newUnreadCount = currentNotifications.filter(n => !n.isRead).length;
              setUnreadCount(newUnreadCount);
              return currentNotifications;
            });
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => 
              prev.filter(notif => notif.id !== payload.old.id)
            );
            // Recalculate unread count if needed
            if (!(payload.old as Notification).isRead) {
              setUnreadCount(prev => prev - 1);
            }
          }
        })
      .subscribe();

    return () => {
      // Clean up subscription
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'all'
    ? notifications
    : activeTab === 'unread'
      ? notifications.filter(n => !n.isRead)
      : activeTab === 'security'
        ? notifications.filter(n => n.category === 'security')
        : activeTab === 'account'
          ? notifications.filter(n => n.category === 'account')
          : activeTab === 'sso'
            ? notifications.filter(n => n.category === 'sso')
            : notifications;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="font-semibold text-sm">Notifications</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={fetchNotifications}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs" 
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex justify-start p-1 w-full h-10 bg-muted/5">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
            <TabsTrigger value="account" className="text-xs">Account</TabsTrigger>
            <TabsTrigger value="sso" className="text-xs">SSO Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="p-0 m-0">
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 text-muted-foreground/50" />
                  <p className="text-sm">No notifications</p>
                  <p className="text-xs mb-3">You&apos;re all caught up!</p>
                  <Link href="/settings/notifications">
                    <Button variant="link" size="sm" className="text-xs">
                      Update notification settings
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {filteredNotifications.map((notification) => (
                    <React.Fragment key={notification.id}>
                      <NotificationItem 
                        notification={notification} 
                        onMarkAsRead={markAsRead} 
                      />
                      <Separator />
                    </React.Fragment>
                  ))}
                </>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <div className="p-2 border-t text-center">
          <Link href="/settings/notifications">
            <Button variant="ghost" size="sm" className="text-xs w-full">
              Manage notification settings
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter; 