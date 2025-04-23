import React, { useState } from 'react';

const CompanyDataExport: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async () => {
    setDownloading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/admin/export');
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      // Extract filename from Content-Disposition header
      const disposition = res.headers.get('Content-Disposition');
      let filename = 'Company_Data_Export.json';
      if (disposition) {
        const match = disposition.match(/filename="(.+?)"/);
        if (match) filename = match[1];
      }
      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccess('Company data export has been downloaded successfully.');
    } catch (e) {
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
      >
        {downloading ? 'Generating export...' : 'Download Company Data'}
      </button>
      {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default CompanyDataExport;
