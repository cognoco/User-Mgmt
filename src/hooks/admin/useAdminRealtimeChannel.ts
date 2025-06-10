import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/auth/useAuth';

interface AdminRealtimeOptions {
  enabled?: boolean;
}

export function useAdminRealtimeChannel(options: AdminRealtimeOptions = {}) {
  const { enabled = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  const [userChangeListeners] = useState(new Set<(payload: any) => void>());

  const addUserChangeListener = useCallback(
    (listener: (payload: any) => void) => {
      userChangeListeners.add(listener);
      return () => {
        userChangeListeners.delete(listener);
      };
    },
    [userChangeListeners]
  );

  useEffect(() => {
    if (!user || !enabled) return;

    const channel = supabase.channel('admin_notifications', {
      config: { broadcast: { self: false } },
    });

    channel.on('broadcast', { event: 'user_change' }, (payload) => {
      console.log('Received user change broadcast:', payload);
      userChangeListeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (error) {
          console.error('Error in user change listener:', error);
        }
      });
    });

    channel.subscribe((status) => {
      console.log('Admin realtime channel status:', status);
      setIsConnected(status === 'SUBSCRIBED');
    });

    return () => {
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, [user, enabled, userChangeListeners]);

  return { isConnected, addUserChangeListener };
}
