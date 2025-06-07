import React from 'react';
import type { SsoProvider } from '@/types/sso';
import { SsoProviderList as HeadlessList } from '@/ui/headless/sso/SsoProviderList';
import { SsoProviderButton } from '@/src/ui/styled/sso/SsoProviderButton';

export interface StyledSsoProviderListProps {
  providers: SsoProvider[];
  onSelect?: (providerId: string) => void;
}

export function SsoProviderList({ providers, onSelect }: StyledSsoProviderListProps) {
  return (
    <HeadlessList
      providers={providers}
      render={(p) => (
        <SsoProviderButton provider={p} onClick={() => onSelect?.(p.id)} />
      )}
    />
  );
}

export default SsoProviderList;
