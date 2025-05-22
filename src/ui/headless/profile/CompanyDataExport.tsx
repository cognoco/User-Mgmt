/**
 * Headless Company Data Export Component
 *
 * Handles requesting and downloading company data exports.
 */

import { useState } from 'react';

export interface CompanyDataExportRenderProps {
  isExporting: boolean;
  error: string | null;
  success: string | null;
  exportData: () => Promise<void>;
}

export interface CompanyDataExportProps {
  children: (props: CompanyDataExportRenderProps) => React.ReactNode;
}

export function CompanyDataExport({ children }: CompanyDataExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const exportData = async () => {
    setIsExporting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/company/export');
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const blob = await res.blob();
      const contentDisposition = res.headers.get('content-disposition');
      let filename = 'Company_Data_Export.json';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setSuccess('Company data export has been downloaded successfully.');
    } catch (err: any) {
      setError('Failed to export company data.');
    } finally {
      setIsExporting(false);
    }
  };

  return <>{children({ isExporting, error, success, exportData })}</>;
}

export default CompanyDataExport;
