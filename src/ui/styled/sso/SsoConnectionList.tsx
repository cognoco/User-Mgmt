import React from 'react';
import type { SsoConnection } from '@/types/sso';
import { SsoConnectionList as HeadlessList } from '@/ui/headless/sso/SsoConnectionList';

export interface StyledSsoConnectionListProps {
  connections: SsoConnection[];
  onDisconnect?: (connectionId: string) => void;
}

export function SsoConnectionList({ connections, onDisconnect }: StyledSsoConnectionListProps) {
  return (
    <HeadlessList
      connections={connections}
      render={(c) => (
        <div className="flex items-center justify-between border p-2 rounded-md mb-2" key={c.id}>
          <span>{c.providerName}</span>
          <button onClick={() => onDisconnect?.(c.id)} className="text-sm text-red-600">Disconnect</button>
        </div>
      )}
    />
  );
}

export default SsoConnectionList;
