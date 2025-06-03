'use client';

import { Alert, AlertDescription, AlertTitle } from '@/ui/primitives/alert';
import { useTranslation } from 'react-i18next';
import { isRtlLanguage } from '@/lib/i18n/messages';

interface ApiErrorAlertProps {
  message: string | null;
  onRetry?: () => void;
}

/**
 * Display user-friendly API error messages with optional retry.
 */
export function ApiErrorAlert({ message, onRetry }: ApiErrorAlertProps) {
  const { i18n } = useTranslation();
  const dir = isRtlLanguage(i18n.language) ? 'rtl' : undefined;
  if (!message) return null;

  return (
    <Alert variant="destructive" role="alert" dir={dir}>
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
