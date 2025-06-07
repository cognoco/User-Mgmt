import React from 'react';
import { PermissionAuditDashboard as Headless } from '@/ui/headless/audit/PermissionAuditDashboard';
import { PermissionLogTimeline } from '@/ui/styled/audit/PermissionLogTimeline';
import { PermissionHistoryView } from '@/ui/styled/audit/PermissionHistoryView';
import { PermissionDiffViewer } from '@/ui/styled/audit/PermissionDiffViewer';
import { PermissionSummary } from '@/ui/styled/audit/PermissionSummary';
import type { PermissionAuditDashboardProps } from '@/ui/headless/audit/PermissionAuditDashboard';

export function PermissionAuditDashboard(props: Omit<PermissionAuditDashboardProps, 'children'>) {
  return (
    <Headless {...props}>
      {({ logs }) => (
        <div className="space-y-4">
          <PermissionSummary logs={logs} />
          <PermissionLogTimeline logs={logs} />
          <PermissionHistoryView logs={logs} />
          {logs.length >= 2 && (
            <PermissionDiffViewer
              before={logs[0].details?.before ?? logs[0].details?.after}
              after={logs[logs.length - 1].details?.after ?? logs[logs.length - 1].details?.before}
            />
          )}
        </div>
      )}
    </Headless>
  );
}
