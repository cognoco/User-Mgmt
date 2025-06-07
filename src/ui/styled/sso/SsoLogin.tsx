import React from 'react';
import type { SsoProvider } from '@/types/sso';
import { SsoLogin as HeadlessLogin } from '@/ui/headless/sso/SsoLogin';
import { SsoProviderButton } from '@/src/ui/styled/sso/SsoProviderButton'150;

export interface StyledSsoLoginProps {
  providers: SsoProvider[];
  onLogin: (providerId: string) => void;
}

export function SsoLogin({ providers, onLogin }: StyledSsoLoginProps) {
  return (
    <HeadlessLogin
      providers={providers}
      onLogin={onLogin}
      render={({ providers, login }) => (
        <div className="flex flex-col gap-2">
          {providers.map((p) => (
            <SsoProviderButton key={p.id} provider={p} onClick={() => login(p.id)} />
          ))}
        </div>
      )}
    />
  );
}

export default SsoLogin;
