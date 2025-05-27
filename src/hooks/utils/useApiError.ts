import { useState } from 'react';

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

  const handleError = (err: ApiErrorShape | Error) => {
    let message = 'An unexpected error occurred.';

    if ('code' in err && err.code) {
      switch (err.code) {
        case 'auth/unauthorized':
          message = 'Please log in to continue.';
          break;
        case 'validation/error':
          message = err.message;
          break;
        case 'server/internal_error':
          message = 'Server error. Please try again later.';
          break;
        default:
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
