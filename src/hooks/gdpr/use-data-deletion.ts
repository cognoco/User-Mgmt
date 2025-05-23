import { useState } from 'react';
import { api } from '@/lib/api/axios';

/**
 * Hook for requesting deletion of personal data via the GDPR API.
 */
export function useDataDeletion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const requestDeletion = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.post('/gdpr/delete');
      setSuccess(true);
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Deletion failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, success, requestDeletion };
}

export default useDataDeletion;
