import { UserLayout as HeadlessUserLayout } from "@/ui/headless/layout/UserLayout";

interface UserLayoutProps {
  children: React.ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  return (
    <HeadlessUserLayout>
      {({ SessionPolicyEnforcer }) => (
        <SessionPolicyEnforcer>
          {children}
        </SessionPolicyEnforcer>
      )}
    </HeadlessUserLayout>
  );
}
