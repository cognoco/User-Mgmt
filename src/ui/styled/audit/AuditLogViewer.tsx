"use client";

import React from 'react';
import { HeadlessAuditLogViewer } from '@/ui/headless/audit/AuditLogViewer';

export function AuditLogViewer({ isAdmin = true }: { isAdmin?: boolean }) {
  if (!isAdmin) {
    return (
      <div className="w-full">
        <div className="text-red-600 font-semibold">Access denied: Admins only.</div>
      </div>
    );
  }

  return (
    <HeadlessAuditLogViewer isAdmin={isAdmin}>
      {() => (
        <div>
          <h2>Audit Logs</h2>
        </div>
      )}
    </HeadlessAuditLogViewer>
  );
}
