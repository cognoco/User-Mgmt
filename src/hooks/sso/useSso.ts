import { useState } from 'react';
import { useSsoService } from '@/lib/context/SsoContext';
import type { SsoProvider, SsoConnection } from '@/types/sso';

export function useSso() {
  const ssoService = useSsoService();
  const [providers, setProviders] = useState<SsoProvider[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<SsoConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await ssoService.listProviders();
      setProviders(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await ssoService.listConnections();
      setConnectedProviders(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  const connectProvider = async (providerId: string) => {
    setLoading(true);
    setError(null);
    try {
      await ssoService.connect(providerId);
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect provider');
    } finally {
      setLoading(false);
    }
  };

  const disconnectProvider = async (connectionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await ssoService.disconnect(connectionId);
      setConnectedProviders(prev => prev.filter(c => c.id !== connectionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect provider');
    } finally {
      setLoading(false);
    }
  };

  return {
    providers,
    connectedProviders,
    loading,
    error,
    fetchProviders,
    fetchConnections,
    connectProvider,
    disconnectProvider
  };
}

export default useSso;
