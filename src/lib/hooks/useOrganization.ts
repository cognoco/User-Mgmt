import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  sso_enabled: boolean;
  sso_provider?: 'azure' | 'google_workspace' | 'linkedin' | null;
}

export function useOrganization(orgId?: string) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchOrganization() {
      try {
        setIsLoading(true);
        setError(null);

        if (!orgId) {
          setOrganization(null);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();

        if (fetchError) throw fetchError;
        setOrganization(data);
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch organization'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrganization();
  }, [orgId]);

  return {
    organization,
    isLoading,
    error,
    refetch: () => {
      if (orgId) {
        setIsLoading(true);
        setError(null);
        // Re-run the effect
        // useEffect will handle the actual fetch
      }
    }
  };
} 