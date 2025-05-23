import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSso } from '@/hooks/sso/useSso';
import type { SsoProvider, SsoConnection } from '@/types/sso';

export interface SSOConnectorRenderProps {
  providers: SsoProvider[];
  connections: SsoConnection[];
  loading: boolean;
  error: string | null;
  connect: (providerId: string) => Promise<void>;
  disconnect: (connectionId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export interface SSOConnectorProps {
  onConnect?: (providerId: string) => Promise<void>;
  onDisconnect?: (connectionId: string) => Promise<void>;
  children: (props: SSOConnectorRenderProps) => ReactNode;
}

export function SSOConnector({ onConnect, onDisconnect, children }: SSOConnectorProps) {
  const {
    providers,
    connectedProviders,
    loading,
    error,
    fetchProviders,
    fetchConnections,
    connectProvider,
    disconnectProvider,
  } = useSso();

  useEffect(() => {
    void fetchProviders();
    void fetchConnections();
  }, [fetchProviders, fetchConnections]);

  const connect = async (providerId: string) => {
    if (onConnect) {
      await onConnect(providerId);
    } else {
      await connectProvider(providerId);
      await fetchConnections();
    }
  };

  const disconnect = async (connectionId: string) => {
    if (onDisconnect) {
      await onDisconnect(connectionId);
    } else {
      await disconnectProvider(connectionId);
      await fetchConnections();
    }
  };

  const refresh = async () => {
    await Promise.all([fetchProviders(), fetchConnections()]);
  };

  return <>{children({ providers, connections: connectedProviders, loading, error, connect, disconnect, refresh })}</>;
}

export default SSOConnector;
