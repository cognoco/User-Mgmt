import React from 'react';

export interface PermissionDiffViewerProps {
  before: unknown;
  after: unknown;
}

export function PermissionDiffViewer({ before, after }: PermissionDiffViewerProps) {
  return (
    <pre>{JSON.stringify({ before, after }, null, 2)}</pre>
  );
}
