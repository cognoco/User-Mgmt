import { Loader2, WifiOff } from 'lucide-react';
import useOfflineStatus from '@/hooks/utils/useOfflineStatus';

interface OfflineStatusBarProps {
  position?: 'top' | 'bottom';
  queueLength?: number;
  onRetry?: () => void;
}

export function OfflineStatusBar({
  position = 'top',
  queueLength = 0,
  onRetry,
}: OfflineStatusBarProps) {
  const { isOffline, isReconnecting } = useOfflineStatus(queueLength);

  if (!isOffline && !isReconnecting) return null;

  return (
    <div
      className={`offline-status-bar ${position} ${
        isReconnecting ? 'reconnecting' : 'offline'
      } flex items-center gap-2 text-sm p-2 bg-muted`}
    >
      {isOffline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>
            You are offline.{' '}
            {queueLength > 0 && `${queueLength} operations pending.`}
          </span>
          {onRetry && (
            <button onClick={onRetry} className="retry-button underline ml-2">
              Try again
            </button>
          )}
        </>
      ) : (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Reconnecting...</span>
        </>
      )}
    </div>
  );
}
export default OfflineStatusBar;
