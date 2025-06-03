import React from 'react';
import { PermissionDiffViewer as Headless } from '@/ui/headless/audit/PermissionDiffViewer';
import type { PermissionDiffViewerProps } from '@/ui/headless/audit/PermissionDiffViewer';

export function PermissionDiffViewer(props: PermissionDiffViewerProps) {
  return (
    <div className="bg-gray-50 p-2 rounded">
      <Headless {...props} />
    </div>
  );
}
