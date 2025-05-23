import { useState } from 'react';
import { api } from '@/lib/api/axios';

/**
 * Hook for requesting a personal data export via the GDPR API.
 * Returns a download URL when the export is complete.
 */
export function useDataExport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const requestExport = async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    setDownloadUrl(null);
    try {
      const response = await api.get('/gdpr/export', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      return url;
    } catch (err: any) {
      setError(err?.message || 'Failed to export data');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, downloadUrl, requestExport };
}

export default useDataExport;
