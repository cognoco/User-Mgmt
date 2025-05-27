'use client';

import { Alert, AlertDescription, AlertTitle } from '@/ui/primitives/alert';

interface ApiErrorAlertProps {
  message: string | null;
  onRetry?: () => void;
}

/**
 * Display user-friendly API error messages with optional retry.
 */
export function ApiErrorAlert({ message, onRetry }: ApiErrorAlertProps) {
  if (!message) return null;

  return (
    <Alert variant="destructive" role="alert">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-2">
        <span>{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="underline text-sm"
          >
            Retry
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}
export default ApiErrorAlert;
