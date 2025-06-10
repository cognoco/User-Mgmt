import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { subscribeToTableChanges } from '@/lib/realtime/supabaseRealtime';

interface RealtimeUserSearchProps {
  onUserChange: (payload: any) => void;
  enabled?: boolean;
}

export function useRealtimeUserSearch({ onUserChange, enabled = true }: RealtimeUserSearchProps) {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !enabled) return;
    const subscription = subscribeToTableChanges('profiles', '*', (_payload) => {
      onUserChange(_payload);
    });
    setIsConnected(true);
    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [user, enabled, onUserChange]);

  return { isConnected };
}
