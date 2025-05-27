import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/ui/primitives/button';
import { Alert, AlertTitle, AlertDescription } from '@/ui/primitives/alert';

interface QueryErrorProps {
  error: string | Error;
  onRetry?: () => void;
  title?: string;
}

export function QueryError({
  error,
  onRetry,
  title = 'Error Loading Data',
}: QueryErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="mt-2">{errorMessage}</div>
        {onRetry && (
          <Button
            onClick={onRetry}
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
