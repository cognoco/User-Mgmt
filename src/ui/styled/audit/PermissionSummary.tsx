import React from 'react';
import { PermissionSummary as Headless } from '@/ui/headless/audit/PermissionSummary';
import type { PermissionSummaryProps } from '@/ui/headless/audit/PermissionSummary';

export function PermissionSummary(props: PermissionSummaryProps) {
  return (
    <div className="font-bold">
      <Headless {...props} />
    </div>
  );
}
