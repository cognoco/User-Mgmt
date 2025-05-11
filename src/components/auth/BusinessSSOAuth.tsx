'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OAuthButtons } from './OAuthButtons';
import { useOrganization } from '@/lib/hooks/useOrganization';
import { supabase } from '@/lib/supabase';
import { Provider } from '@supabase/supabase-js';

interface BusinessSSOAuthProps {
  className?: string;
}

export function BusinessSSOAuth({ className = '' }: BusinessSSOAuthProps) {
  const { t } = useTranslation();
  const { organization } = useOrganization();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);

      if (!organization?.sso_provider) {
        throw new Error('No SSO provider configured');
      }

      // Map organization SSO provider to OAuth provider
      let provider: Provider;
      let options: any = {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          organization_id: organization.id
        }
      };

      // Configure provider-specific options
      switch (organization.sso_provider) {
        case 'azure':
          provider = 'azure' as Provider;
          break;
        case 'google_workspace':
          provider = 'google' as Provider;
          options.queryParams.access_type = 'offline';
          options.queryParams.hd = organization.domain;
          break;
        case 'linkedin':
          provider = 'linkedin' as Provider;
          options.scopes = 'r_emailaddress r_liteprofile';
          break;
        default:
          throw new Error('Unsupported SSO provider');
      }

      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options
      });

      if (authError) throw authError;
      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') { console.error('SSO authentication error:', err) }
      setError(t('auth.errors.ssoFailed'));
    }
  };

  if (!organization?.sso_enabled) {
    return (
      <Alert className={className}>
        <AlertDescription>
          {t('auth.errors.ssoNotEnabled')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={className}>
      {organization && (
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold">{organization.name}</h2>
          <p className="text-sm text-muted-foreground">
            {t('auth.sso.organizationLogin')}
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <OAuthButtons
        mode="login"
        layout="vertical"
        showLabels={true}
        className="w-full"
        onSuccess={handleLogin}
      />
    </div>
  );
} 