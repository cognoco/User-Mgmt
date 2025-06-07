import { Outlet } from "react-router-dom";
import { UserLayout as HeadlessUserLayout } from "@/src/ui/headless/layout/UserLayout"44;

export function UserLayout() {
  return (
    <HeadlessUserLayout>
      {({ SessionPolicyEnforcer }) => (
        <SessionPolicyEnforcer>
          <Outlet />
        </SessionPolicyEnforcer>
      )}
    </HeadlessUserLayout>
  );
}
