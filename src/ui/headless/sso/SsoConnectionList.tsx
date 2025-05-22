import React from 'react';
import type { SsoConnection } from '@/types/sso';

export interface SsoConnectionListProps {
  connections: SsoConnection[];
  render: (connection: SsoConnection) => React.ReactNode;
}

export function SsoConnectionList({ connections, render }: SsoConnectionListProps) {
  return <>{connections.map(c => render(c))}</>;
}

export default SsoConnectionList;
