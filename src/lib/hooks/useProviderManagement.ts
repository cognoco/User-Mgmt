import { useCallback, useState } from 'react';

export function useLinkedProviders() {
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinkedProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/me'); // Adjust endpoint as needed
      if (!res.ok) throw new Error('Failed to fetch linked providers');
      const data = await res.json();
      setLinkedProviders(data.linkedProviders || []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { linkedProviders, loading, error, fetchLinkedProviders };
}

export function useLinkProvider() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkProvider = useCallback(async (provider: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/oauth/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, code }),
      });
      if (!res.ok) throw new Error('Failed to link provider');
      return await res.json();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { linkProvider, loading, error };
}

export function useUnlinkProvider() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlinkProvider = useCallback(async (provider: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/oauth/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      if (!res.ok) throw new Error('Failed to unlink provider');
      return await res.json();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { unlinkProvider, loading, error };
} 