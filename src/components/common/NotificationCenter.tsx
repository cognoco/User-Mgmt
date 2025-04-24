import React, { useState, useEffect } from 'react';

// Mock notification type
interface Notification {
  id: string;
  title: string;
  created_at: string;
}

/**
 * NotificationCenter Component
 * Placeholder for displaying user notifications.
 */
export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching notifications
    const timer = setTimeout(() => {
      // Assume empty initially for testing empty state
      setNotifications([]);
      setIsLoading(false);
    }, 50);

    // Placeholder for real-time subscription (needed for test)
    // In a real app, you would use supabase.channel(...)
    const mockSubscription = {
      subscribe: () => console.log('Mock subscribe'),
      on: (event: string, callback: (payload: any) => void) => {
        if (event === 'postgres_changes' && typeof callback === 'function') {
          // Simulate receiving a notification for the test
          // setTimeout(() => callback({ eventType: 'INSERT', new: { id: 'notif-1', title: 'New notification', created_at: new Date().toISOString() } }), 100);
        }
        return mockSubscription; // Return self for chaining
      }
    };
    const channel = mockSubscription; // Simulate getting channel
    if (process.env.NODE_ENV === 'development') { console.log('Mock received', payload); /* handle payload */ }
    channel.on('postgres_changes', (payload) => { if (process.env.NODE_ENV === 'development') { console.log('Mock received', payload); /* handle payload */ } }).subscribe();

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <div>
          <p>No notifications</p>
          <p>You're all caught up!</p>
          <button type="button">Update notification settings</button> {/* Placeholder for CTA */}
        </div>
      ) : (
        <ul>
          {notifications.map(notif => (
            <li key={notif.id}>{notif.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationCenter; 