import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/ui/primitives/button';
import { Alert, AlertTitle, AlertDescription } from '@/ui/primitives/alert';
import { useErrorHandling } from '@/hooks/errors/useErrorHandling';

interface QueryErrorProps {
  error: string | Error;
  onRetry?: () => Promise<void> | void;
  title?: string;
  /** Automatically retry on mount */
  autoRetry?: boolean;
  /** Maximum retries when autoRetry is enabled */
  maxRetries?: number;
  /** Optional help URL for troubleshooting */
  helpUrl?: string;
}

export function QueryError({
  error,
  onRetry,
  title = 'Error Loading Data',
  autoRetry = false,
  maxRetries = 3,
  helpUrl,
}: QueryErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const { retry, retryCount, isLoading } = useErrorHandling({
    retryFn: onRetry,
    maxRetries,
  });

  useEffect(() => {
    if (autoRetry && onRetry) {
      void retry();
    }
  }, [autoRetry, onRetry, retry]);

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="mt-2">{errorMessage}</div>
        {autoRetry && isLoading && (
          <p className="text-sm text-muted-foreground mt-1">
            Retrying... ({retryCount}/{maxRetries})
          </p>
        )}
        {helpUrl && (
          <a
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-sm mt-2 block"
          >
            Need help?
          </a>
        )}
        {onRetry && (
          <Button
            onClick={() => void retry()}
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
