import { SessionPolicyEnforcer } from '@/ui/styled/session/SessionPolicyEnforcer';

export interface UserLayoutProps {
  children: (props: { SessionPolicyEnforcer: typeof SessionPolicyEnforcer }) => React.ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  return <>{children({ SessionPolicyEnforcer })}</>;
}
