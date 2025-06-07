import React from 'react';
import { PermissionAuditDashboard as Headless } from '@/ui/headless/audit/PermissionAuditDashboard';
import { PermissionLogTimeline } from '@/src/ui/styled/audit/PermissionLogTimeline'130;
import { PermissionHistoryView } from '@/src/ui/styled/audit/PermissionHistoryView'196;
import { PermissionDiffViewer } from '@/src/ui/styled/audit/PermissionDiffViewer'262;
import { PermissionSummary } from '@/src/ui/styled/audit/PermissionSummary'326;
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
