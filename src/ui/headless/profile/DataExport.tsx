import { useState, useCallback } from 'react';
import useDataExport from '@/hooks/user/useDataExport';
import { ExportStatus } from '@/lib/exports/types';

/** Possible states of the export process */
export type PersonalExportStatus = 'not_started' | 'in_progress' | 'ready' | 'error';

/** Render props for the DataExport component */
export interface DataExportRenderProps {
  /** Current export status */
  exportStatus: PersonalExportStatus;
  /** Download URL if available */
  downloadUrl: string | null;
  /** Expiration time for the download URL */
  expiryTime: Date | null;
  /** Error message if any */
  errors: string | null;
  /** Date of the last export request */
  lastExportDate: Date | null;
  /** Initiate a new export */
  onRequestExport: () => Promise<void>;
  /** Attempt to download the export */
  onDownload: () => Promise<void>;
  /** Whether an export request is currently processing */
  isLoading: boolean;
}

/** Props for DataExport */
export interface DataExportProps {
  /** Render prop to control rendering */
  children: (props: DataExportRenderProps) => React.ReactNode;
}

/**
 * Headless component handling personal data export flow.
 */
export function DataExport({ children }: DataExportProps) {
  const { requestExport, refreshStatus, status, isLoading, error } = useDataExport();

  const [exportStatus, setExportStatus] = useState<PersonalExportStatus>('not_started');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [lastExportDate, setLastExportDate] = useState<Date | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const onRequestExport = useCallback(async () => {
    setLocalError(null);
    const res = await requestExport();
    if (!res) {
      setExportStatus('error');
      setLocalError(error);
      return;
    }
    setLastExportDate(new Date());
    if (res.status === ExportStatus.COMPLETED) {
      setExportStatus('ready');
      setDownloadUrl(res.downloadUrl || null);
      setExpiryTime(new Date(Date.now() + 24 * 60 * 60 * 1000));
    } else {
      setExportStatus('in_progress');
    }
  }, [requestExport, error]);

  const onDownload = useCallback(async () => {
    setLocalError(null);
    if (exportStatus === 'in_progress') {
      const res = await refreshStatus();
      if (!res) {
        setExportStatus('error');
        setLocalError(error);
        return;
      }
      if (res.status === ExportStatus.COMPLETED) {
        setExportStatus('ready');
        setDownloadUrl(res.downloadUrl || null);
        setExpiryTime(new Date(Date.now() + 24 * 60 * 60 * 1000));
      } else if (res.status === ExportStatus.FAILED) {
        setExportStatus('error');
        setLocalError(res.message);
      }
    }
  }, [exportStatus, refreshStatus, error]);

  return (
    <>
      {children({
        exportStatus,
        downloadUrl,
        expiryTime,
        errors: localError,
        lastExportDate,
        onRequestExport,
        onDownload,
        isLoading,
      })}
    </>
  );
}

export default DataExport;
