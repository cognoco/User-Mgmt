import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatErrorMessage } from '@/lib/i18n/messages';
import { ApiError } from '@/lib/api/common';

interface ApiErrorShape {
  code?: string;
  message: string;
  details?: unknown;
}

export interface ParsedApiError {
  message: string;
  code: string;
  status: number;
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
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
        // If translation key wasn't found, use fallback messages
        switch (err.code) {
          case 'AUTH_ACCESS_001':
            message = 'Please log in to continue.';
            break;
          case 'VALIDATION_REQUEST_001':
            message = err.message;
            break;
          case 'SERVER_GENERAL_001':
            message = 'Server error. Please try again later.';
            break;
          default:
            message = err.message || message;
        }
      }
    } else if (err instanceof Error) {
      message = err.message;
    }

    setError(message);
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
}

export function parseApiError(err: unknown): ParsedApiError {
  if (isApiError(err)) {
    return {
      message: err.message,
      code: err.code,
      status: err.status,
    };
  }

  if (err instanceof Error) {
    return {
      message: err.message,
      code: 'UNKNOWN_ERROR',
      status: 500,
    };
  }

  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    status: 500,
  };
}

export default useApiError;
