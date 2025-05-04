import React, { useState } from 'react';

const CompanyDataExport: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    setSuccess(null);
    setDownloading(true);
    // eslint-disable-next-line no-console
    console.log('DEBUG: handleExport called');
    try {
      // eslint-disable-next-line no-console
      console.log('DEBUG: Fetching /api/company/export');
      const res = await fetch('/api/company/export');
      // eslint-disable-next-line no-console
      console.log('DEBUG: Fetch response', res);
      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.log('DEBUG: Response not ok');
        throw new Error(await res.text());
      }
      const blob = await res.blob();
      // eslint-disable-next-line no-console
      console.log('DEBUG: Got blob', blob);
      const contentDisposition = res.headers.get('content-disposition');
      // eslint-disable-next-line no-console
      console.log('DEBUG: contentDisposition', contentDisposition);
      let filename = 'Company_Data_Export.json';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      const url = URL.createObjectURL(blob);
      // eslint-disable-next-line no-console
      console.log('DEBUG: Blob URL', url);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      // eslint-disable-next-line no-console
      console.log('DEBUG: Clicking anchor');
      a.click();
      a.remove();
      setSuccess('Company data export has been downloaded successfully.');
      // eslint-disable-next-line no-console
      console.log('DEBUG: setSuccess(true)');
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.log('DEBUG: Error in handleExport', err);
      setError('Failed to export company data.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded border p-4 max-w-lg mx-auto bg-white shadow mt-6">
      <h3 className="text-lg font-semibold mb-2">Export Company Data</h3>
      <p className="text-sm text-gray-600 mb-4">
        Download a copy of your company profile, team members, roles, and activity logs. This export is provided in JSON format for compliance, backup, or migration needs. Only company admins can access this export.
      </p>
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        onClick={handleExport}
        disabled={downloading}
        {...(downloading ? { role: "status" } : {})}
      >
        {downloading ? 'Generating export...' : 'Download Company Data'}
      </button>
      {success && <div className="text-green-600 text-sm mt-2" role="alert">{success}</div>}
      {error && <div className="text-red-600 text-sm mt-2" role="alert">{error}</div>}
    </div>
  );
};

export default CompanyDataExport;
