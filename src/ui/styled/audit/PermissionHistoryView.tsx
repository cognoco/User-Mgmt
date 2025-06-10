import React from 'react';
import { PermissionHistoryView as Headless } from '@/ui/headless/audit/PermissionHistoryView';
import type { PermissionHistoryViewProps } from '@/ui/headless/audit/PermissionHistoryView';

export function PermissionHistoryView(props: PermissionHistoryViewProps) {
  return (
    <div className="space-y-1">
      <Headless {...props} />
    </div>
  );
}
