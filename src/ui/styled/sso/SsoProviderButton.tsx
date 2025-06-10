import React from 'react';
import type { SsoProvider } from '@/types/sso';

export interface SsoProviderButtonProps {
  provider: SsoProvider;
  onClick: () => void;
}

export function SsoProviderButton({ provider, onClick }: SsoProviderButtonProps) {
  return (
    <button onClick={onClick} className="px-3 py-2 border rounded-md hover:bg-gray-100">
      {provider.name}
    </button>
  );
}

export default SsoProviderButton;
