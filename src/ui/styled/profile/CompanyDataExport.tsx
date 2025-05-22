import React from 'react';
import { CompanyDataExport as HeadlessCompanyDataExport } from '@/ui/headless/profile/CompanyDataExport';

const CompanyDataExport: React.FC = () => (
  <HeadlessCompanyDataExport>
    {({ isExporting, error, success, exportData }) => (
      <div className="rounded border p-4 max-w-lg mx-auto bg-white shadow mt-6">
        <h3 className="text-lg font-semibold mb-2">Export Company Data</h3>
        <p className="text-sm text-gray-600 mb-4">
          Download a copy of your company profile, team members, roles, and activity logs. This export is provided in JSON format for compliance, backup, or migration needs. Only company admins can access this export.
        </p>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          onClick={exportData}
          disabled={isExporting}
          {...(isExporting ? { role: 'status' } : {})}
        >
          {isExporting ? 'Generating export...' : 'Download Company Data'}
        </button>
        {success && (
          <div className="text-green-600 text-sm mt-2" role="alert">
            {success}
          </div>
        )}
        {error && (
          <div className="text-red-600 text-sm mt-2" role="alert">
            {error}
          </div>
        )}
      </div>
    )}
  </HeadlessCompanyDataExport>
);

export default CompanyDataExport;
