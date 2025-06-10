import { useEffect, useState } from 'react';
import useOfflineDetection from '@/hooks/utils/useOfflineDetection';

export interface OfflineStatus {
  isOffline: boolean;
  isReconnecting: boolean;
}

export function useOfflineStatus(queueLength = 0): OfflineStatus {
  const isOffline = useOfflineDetection();
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setIsReconnecting(false);
      return;
    }
    if (queueLength > 0) {
      setIsReconnecting(true);
    } else {
      setIsReconnecting(false);
    }
  }, [isOffline, queueLength]);

  return { isOffline, isReconnecting };
}
export default useOfflineStatus;
