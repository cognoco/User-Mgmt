import { ReactNode } from 'react';
import { SessionPolicyEnforcer } from '@/ui/styled/session/session-policy-enforcer';

export interface UserLayoutProps {
  children: (props: { SessionPolicyEnforcer: typeof SessionPolicyEnforcer }) => React.ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  return <>{children({ SessionPolicyEnforcer })}</>;
}
