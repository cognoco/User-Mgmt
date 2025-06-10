import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import {
  isUserRateLimited,
  createUserDataExport,
  processUserDataExport,
  checkUserExportStatus
} from '@/lib/exports/export.service';
import type { ExportOptions, DataExportResponse } from '@/lib/exports/types';

/**
 * Hook for initiating and tracking personal data exports
 */
export function useDataExport() {
  const { user } = useAuth();
  const [status, setStatus] = useState<DataExportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Request a new data export for the current user
   */
  const requestExport = useCallback(async (options?: Partial<ExportOptions>) => {
    if (!user?.id) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const rateLimited = await isUserRateLimited(user.id);
      if (rateLimited) {
        setError('You have requested a data export recently. Please try again later.');
        return null;
      }

      const record = await createUserDataExport(user.id, options);
      if (!record) throw new Error('Failed to start data export');

      if (!record.isLargeDataset) {
        await processUserDataExport(record.id, user.id);
      }

      const res = await checkUserExportStatus(record.id);
      setStatus(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Refresh the status of the current export
   */
  const refreshStatus = useCallback(async () => {
    if (!status || !user?.id) return null;
    setIsLoading(true);
    try {
      const res = await checkUserExportStatus(status.id);
      setStatus(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to check export status');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [status, user]);

  return { status, isLoading, error, requestExport, refreshStatus };
}

export default useDataExport;
