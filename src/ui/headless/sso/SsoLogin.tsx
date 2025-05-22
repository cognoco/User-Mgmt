import React from 'react';
import type { SsoProvider } from '@/types/sso';

export interface SsoLoginProps {
  providers: SsoProvider[];
  onLogin: (providerId: string) => void;
  render: (props: { providers: SsoProvider[]; login: (providerId: string) => void }) => React.ReactNode;
}

export function SsoLogin({ providers, onLogin, render }: SsoLoginProps) {
  const login = (id: string) => onLogin(id);
  return <>{render({ providers, login })}</>;
}

export default SsoLogin;
