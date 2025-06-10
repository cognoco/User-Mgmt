import React from 'react';
import type { SsoProvider } from '@/types/sso';

export interface SsoProviderListProps {
  providers: SsoProvider[];
  render: (provider: SsoProvider) => React.ReactNode;
}

export function SsoProviderList({ providers, render }: SsoProviderListProps) {
  return <>{providers.map(p => render(p))}</>;
}

export default SsoProviderList;
