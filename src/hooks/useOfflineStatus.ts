import { useEffect, useState } from 'react';
import {
  clearQueue,
  processQueue,
  subscribeToQueueUpdates,
  unsubscribeFromQueueUpdates,
  verifyConnectivity,
} from '@/lib/services/offlineQueue.service';

function getConnectionQuality(): string {
  const connection = (navigator as any).connection;
  if (!connection) return 'unknown';
  const type = connection.effectiveType;
  if (['slow-2g', '2g'].includes(type)) return 'poor';
  if (type === '3g') return 'fair';
  if (type === '4g') return 'good';
  return 'unknown';
}

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [queueLength, setQueueLength] = useState<number>(0);
  const [connectionQuality, setConnectionQuality] = useState<string>(getConnectionQuality());

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setIsReconnecting(true);
      verifyConnectivity().then(isConnected => {
        setIsReconnecting(!isConnected);
        if (isConnected) {
          processQueue().catch(console.error);
        }
      });
    };

    const handleQueueUpdate = (length: number) => setQueueLength(length);
    const handleConnChange = () => setConnectionQuality(getConnectionQuality());

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    const conn = (navigator as any).connection;
    conn?.addEventListener('change', handleConnChange);
    subscribeToQueueUpdates(handleQueueUpdate);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      conn?.removeEventListener('change', handleConnChange);
      unsubscribeFromQueueUpdates(handleQueueUpdate);
    };
  }, []);

  return {
    isOffline,
    isReconnecting,
    queueLength,
    connectionQuality,
    processQueue: () => processQueue(),
    cancelQueue: () => clearQueue(),
  };
}
