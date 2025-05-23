import { useState } from 'react';
import { api } from '@/lib/api/axios';

export interface OrgSsoSettings {
  sso_enabled: boolean;
  idp_type: 'saml' | 'oidc' | null;
}

export interface OrgSsoStatus {
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  lastSuccessfulLogin: string | null;
  lastError: string | null;
  totalSuccessfulLogins24h: number;
}

export function useOrgSsoConfig(orgId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSettings = async (): Promise<OrgSsoSettings> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/organizations/${orgId}/sso/settings`);
      return data as OrgSsoSettings;
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (settings: OrgSsoSettings): Promise<OrgSsoSettings> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put(`/organizations/${orgId}/sso/settings`, settings);
      return data as OrgSsoSettings;
    } catch (err: any) {
      setError(err?.message || 'Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStatus = async (): Promise<OrgSsoStatus> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/organizations/${orgId}/sso/status`);
      return data as OrgSsoStatus;
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMetadata = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/organizations/${orgId}/sso/metadata`);
      return data as { url: string; entity_id: string; xml: string };
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch metadata');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getIdpConfig = async (idpType: 'saml' | 'oidc') => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/organizations/${orgId}/sso/${idpType}/config`);
      return data as Record<string, any>;
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateIdpConfig = async (idpType: 'saml' | 'oidc', config: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put(`/organizations/${orgId}/sso/${idpType}/config`, config);
      return data as Record<string, any>;
    } catch (err: any) {
      setError(err?.message || 'Failed to update configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getSettings,
    updateSettings,
    getStatus,
    getMetadata,
    getIdpConfig,
    updateIdpConfig,
  };
}

export default useOrgSsoConfig;
