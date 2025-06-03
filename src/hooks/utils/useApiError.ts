import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatErrorMessage } from '@/lib/i18n/messages';

interface ApiErrorShape {
  code?: string;
  message: string;
  details?: unknown;
}

/**
 * Hook to normalize API errors into user-friendly messages.
 */
export function useApiError() {
  const [error, setError] = useState<string | null>(null);
  const { i18n } = useTranslation();

  const handleError = (err: ApiErrorShape | Error) => {
    let message = 'An unexpected error occurred.';

    if ('code' in err && err.code) {
      message = formatErrorMessage(err.code, {}, i18n.language as any);
      if (message === `errors.${err.code}`) {
        message = err.message || message;
      }
    } else if (err instanceof Error) {
      message = err.message;
    }

    setError(message);
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
}
export default useApiError;
